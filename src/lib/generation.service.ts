// src/lib/generation.service.ts
import type { SupabaseClient } from "../db/supabase.client";
import type {
  FlashcardProposalDto,
  GenerationCreateResponseDto,
} from "../types";
import crypto from "crypto";

/**
 * Configuration for the generation service
 */
const GENERATION_CONFIG = {
  MODEL: "mock-gpt-4", // Model name for development
  TIMEOUT_MS: 60000, // 60 seconds timeout
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
 * Mock AI service that generates flashcard proposals
 * In production, this would call an external AI service like OpenRouter
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
    // Step 1: Call AI service with timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new GenerationError(
              "AI generation timeout after 60 seconds",
              "TIMEOUT",
              504,
            ),
          ),
        GENERATION_CONFIG.TIMEOUT_MS,
      ),
    );

    const flashcardsProposals = await Promise.race([
      mockGenerateFlashcards(sourceText),
      timeoutPromise,
    ]);

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

