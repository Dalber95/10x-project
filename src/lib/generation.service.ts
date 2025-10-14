// src/lib/generation.service.ts
import type { SupabaseClient } from "../db/supabase.client";
import type {
  FlashcardProposalDto,
  GenerationCreateResponseDto,
} from "../types";
import crypto from "crypto";
import { createOpenRouterService, OpenRouterError } from "./openrouter.service";
import type { JSONSchema } from "./openrouter.types";

/**
 * Configuration for the generation service
 */
const GENERATION_CONFIG = {
  MODEL: "meta-llama/llama-3.1-8b-instruct", // Llama model via OpenRouter (very cheap, ~$0.0001/request)
  TIMEOUT_MS: 60000, // 60 seconds timeout
  USE_MOCK: import.meta.env.DEV && !import.meta.env.OPENROUTER_API_KEY, // Use mock in dev if no API key
} as const;

/**
 * Custom error class for generation errors
 */
export class GenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "GenerationError";
  }
}

/**
 * JSON schema for flashcard generation response
 */
const FLASHCARD_SCHEMA: JSONSchema = {
  type: "object",
  properties: {
    flashcards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          front: { type: "string" },
          back: { type: "string" },
          source: { type: "string", enum: ["ai-full"] },
        },
        required: ["front", "back", "source"],
      },
    },
  },
  required: ["flashcards"],
};

/**
 * System message for flashcard generation
 */
const SYSTEM_MESSAGE = `You are an AI assistant specialized in creating educational flashcards.
Generate 3-5 high-quality flashcards based on the provided text.

Guidelines:
- Create clear, concise questions on the front
- Provide comprehensive answers on the back
- Focus on key concepts, facts, and relationships
- Ensure questions are self-contained and understandable
- Make answers informative and educational
- Each flashcard should test a distinct piece of knowledge

IMPORTANT: Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, no explanation):
{
  "flashcards": [
    {
      "front": "question text here (max 200 characters)",
      "back": "answer text here (max 500 characters)",
      "source": "ai-full"
    }
  ]
}`;

/**
 * Mock AI service that generates flashcard proposals
 * Used as fallback when OpenRouter API key is not available
 */
async function mockGenerateFlashcards(
  sourceText: string,
): Promise<FlashcardProposalDto[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // For development, generate 3-5 mock flashcards based on text length
  const count = Math.min(5, Math.max(3, Math.floor(sourceText.length / 2000)));

  return Array.from({ length: count }, (_, i) => ({
    front: `Generated Question ${i + 1} based on the source text`,
    back: `Generated Answer ${i + 1} with detailed explanation from the source material`,
    source: "ai-full" as const,
  }));
}

/**
 * Generates flashcards using OpenRouter API
 */
async function generateFlashcardsWithAI(
  sourceText: string,
): Promise<FlashcardProposalDto[]> {
  // Use mock data in development if no API key
  if (GENERATION_CONFIG.USE_MOCK) {
    console.log("🎭 Using mock flashcards (no OpenRouter API key found)");
    return generateMockFlashcards(sourceText);
  }

  try {
    // Create OpenRouter service instance
    const openRouter = createOpenRouterService({
      defaultModel: GENERATION_CONFIG.MODEL,
      timeout: GENERATION_CONFIG.TIMEOUT_MS,
      defaultParameters: {
        temperature: 0.7,
        top_p: 0.9,
      },
    });

    // Configure the service
    openRouter.setSystemMessage(SYSTEM_MESSAGE);
    // Don't use setResponseFormat - not all models support it
    // Instead, we rely on the prompt to request JSON format

    // Generate flashcards
    const responseText = await openRouter.sendChatMessage<string>(sourceText);

    // Parse the response (handle both plain JSON and markdown code blocks)
    let jsonText = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const parsed = JSON.parse(jsonText) as { flashcards: FlashcardProposalDto[] };

    if (!parsed.flashcards || parsed.flashcards.length === 0) {
      throw new GenerationError(
        "AI service returned no flashcard proposals",
        "EMPTY_RESPONSE",
      );
    }

    return parsed.flashcards;
  } catch (error) {
    // Map OpenRouter errors to GenerationError
    if (error instanceof OpenRouterError) {
      console.error('❌ OpenRouter error:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      });
      throw new GenerationError(
        error.message,
        error.code,
        error.statusCode,
      );
    }
    console.error('❌ Unexpected error in generateFlashcardsWithAI:', error);
    throw error;
  }
}

/**
 * Generate mock flashcards for development without API key
 */
function generateMockFlashcards(sourceText: string): FlashcardProposalDto[] {
  const wordCount = sourceText.split(/\s+/).length;
  const cardCount = Math.min(Math.max(Math.floor(wordCount / 50), 3), 10);

  const mockCards: FlashcardProposalDto[] = [];
  
  for (let i = 0; i < cardCount; i++) {
    mockCards.push({
      front: `Pytanie ${i + 1} na podstawie tekstu`,
      back: `Odpowiedź ${i + 1} wygenerowana z fragmentu tekstu. To jest przykładowa fiszka utworzona w trybie deweloperskim bez użycia API OpenRouter.`,
      source: "ai-full" as const,
    });
  }

  return mockCards;
}

/**
 * Calculates SHA-256 hash of the source text
 */
function hashSourceText(sourceText: string): string {
  return crypto.createHash("sha256").update(sourceText).digest("hex");
}

/**
 * Logs generation error to the database
 */
async function logGenerationError(
  supabase: SupabaseClient,
  userId: string,
  sourceText: string,
  errorCode: string,
  errorMessage: string,
): Promise<void> {
  const sourceTextHash = hashSourceText(sourceText);
  const sourceTextLength = sourceText.length;

  const { error } = await supabase.from("generation_error_logs").insert({
    user_id: userId,
    error_code: errorCode,
    error_message: errorMessage,
    model: GENERATION_CONFIG.MODEL,
    source_text_hash: sourceTextHash,
    source_text_length: sourceTextLength,
  });

  if (error) {
    console.error("Failed to log generation error:", error);
  }
}

/**
 * Main service function to generate flashcards from source text
 * Handles the complete flow: AI generation, database insertion, and error logging
 */
export async function generateFlashcards(
  supabase: SupabaseClient,
  userId: string,
  sourceText: string,
): Promise<GenerationCreateResponseDto> {
  const startTime = Date.now();

  try {
    // Step 1: Call AI service (real or mock based on configuration)
    const flashcardsProposals = GENERATION_CONFIG.USE_MOCK
      ? await mockGenerateFlashcards(sourceText)
      : await generateFlashcardsWithAI(sourceText);

    if (!flashcardsProposals || flashcardsProposals.length === 0) {
      throw new GenerationError(
        "AI service returned no flashcard proposals",
        "EMPTY_RESPONSE",
      );
    }

    // Step 2: Calculate generation metadata
    const generationDuration = Date.now() - startTime;
    const sourceTextHash = hashSourceText(sourceText);
    const sourceTextLength = sourceText.length;
    const generatedCount = flashcardsProposals.length;

    // Step 3: Insert generation record into database
    const { data: generationData, error: generationError } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        model: GENERATION_CONFIG.MODEL,
        generated_count: generatedCount,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
        generation_duration: generationDuration,
      })
      .select("id")
      .single();

    if (generationError || !generationData) {
      throw new GenerationError(
        "Failed to save generation metadata",
        "DATABASE_ERROR",
      );
    }

    // Step 4: Return response
    return {
      generation_id: generationData.id,
      flashcards_proposals: flashcardsProposals,
      generated_count: generatedCount,
    };
  } catch (error) {
    // Log error to database
    const errorCode =
      error instanceof GenerationError ? error.code : "UNKNOWN_ERROR";
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    await logGenerationError(
      supabase,
      userId,
      sourceText,
      errorCode,
      errorMessage,
    );

    // Re-throw the error for the endpoint to handle
    if (error instanceof GenerationError) {
      throw error;
    }

    throw new GenerationError(
      "An unexpected error occurred during generation",
      "UNKNOWN_ERROR",
    );
  }
}

