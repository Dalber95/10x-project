// src/lib/openrouter.examples.ts
/**
 * Example usage patterns for OpenRouter Service
 * These examples demonstrate common use cases and best practices
 */

import { createOpenRouterService } from "./openrouter.service";
import type { FlashcardProposalDto } from "../types";
import type { JSONSchema } from "./openrouter.types";

// ================================================================================================
// Example 1: Basic Chat Completion
// ================================================================================================

export async function example1_basicChat() {
  const service = createOpenRouterService();

  service.setSystemMessage("You are a helpful assistant.");
  const response = await service.sendChatMessage<string>("Explain quantum computing in simple terms.");

  return response;
}

// ================================================================================================
// Example 2: Structured JSON Output for Flashcards
// ================================================================================================

export async function example2_flashcardGeneration(sourceText: string) {
  const service = createOpenRouterService({
    defaultModel: "openai/gpt-3.5-turbo",
    defaultParameters: {
      temperature: 0.7,
      top_p: 0.9,
    },
  });

  // Define schema
  const schema: JSONSchema = {
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

  service.setSystemMessage(
    "Generate 3-5 educational flashcards from the provided text. Each flashcard should have a clear question (front) and comprehensive answer (back)."
  );
  service.setResponseFormat(schema);

  const response = await service.sendChatMessage<{
    flashcards: FlashcardProposalDto[];
  }>(sourceText);

  return response.flashcards;
}

// ================================================================================================
// Example 3: Multiple Models Comparison
// ================================================================================================

export async function example3_compareModels(prompt: string) {
  const models = ["openai/gpt-3.5-turbo", "openai/gpt-4", "anthropic/claude-3-sonnet"];

  const results = await Promise.all(
    models.map(async (model) => {
      const service = createOpenRouterService({
        defaultModel: model,
      });

      service.setSystemMessage("You are a concise assistant.");
      const response = await service.sendChatMessage<string>(prompt);
      const metrics = service.getLastRequestMetrics();

      return {
        model,
        response,
        duration: metrics?.requestDuration,
        tokens: metrics?.totalTokens,
      };
    })
  );

  return results;
}

// ================================================================================================
// Example 4: Error Handling Patterns
// ================================================================================================

export async function example4_errorHandling() {
  const service = createOpenRouterService();

  try {
    service.setSystemMessage("You are a helpful assistant.");
    const response = await service.sendChatMessage<string>("Hello!");

    console.log("Success:", response);

    // Get metrics
    const metrics = service.getLastRequestMetrics();
    if (metrics) {
      console.log("Request took:", metrics.requestDuration, "ms");
      console.log("Tokens used:", metrics.totalTokens);
      console.log("Retries:", metrics.retryCount);
    }

    return response;
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      console.error("Error type:", error.name);
      console.error("Error message:", error.message);

      // Get failed metrics
      const metrics = service.getLastRequestMetrics();
      if (metrics && !metrics.success) {
        console.error("Request failed after:", metrics.requestDuration, "ms");
      }
    }

    throw error;
  }
}

// ================================================================================================
// Example 5: Reusable Service with Different Messages
// ================================================================================================

export async function example5_reuseService() {
  const service = createOpenRouterService({
    defaultModel: "openai/gpt-3.5-turbo",
  });

  // Set system message once
  service.setSystemMessage("You are a helpful math tutor. Keep answers brief.");

  // Send multiple different messages
  const questions = ["What is the Pythagorean theorem?", "Explain prime numbers", "What is calculus?"];

  const answers = await Promise.all(questions.map((question) => service.sendChatMessage<string>(question)));

  return questions.map((q, i) => ({ question: q, answer: answers[i] }));
}

// ================================================================================================
// Example 6: Custom Parameters for Creative Writing
// ================================================================================================

export async function example6_creativeWriting(topic: string) {
  const service = createOpenRouterService();

  // Configure for creative output
  service.setModel("openai/gpt-4", {
    temperature: 0.9, // Higher temperature for creativity
    top_p: 0.95, // Allow diverse token selection
    presence_penalty: 0.6, // Encourage new topics
    frequency_penalty: 0.3, // Reduce repetition
  });

  service.setSystemMessage("You are a creative writer. Write engaging, original content.");
  const story = await service.sendChatMessage<string>(`Write a short story about: ${topic}`);

  return story;
}

// ================================================================================================
// Example 7: Structured Data Extraction
// ================================================================================================

export async function example7_dataExtraction(text: string) {
  const service = createOpenRouterService();

  const schema: JSONSchema = {
    type: "object",
    properties: {
      entities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            description: { type: "string" },
          },
          required: ["name", "type"],
        },
      },
    },
    required: ["entities"],
  };

  service.setSystemMessage(
    "Extract key entities (people, places, organizations, concepts) from the text. Return as structured JSON."
  );
  service.setResponseFormat(schema);

  const response = await service.sendChatMessage<{
    entities: {
      name: string;
      type: string;
      description?: string;
    }[];
  }>(text);

  return response.entities;
}

// ================================================================================================
// Example 8: Batch Processing with Rate Limiting
// ================================================================================================

export async function example8_batchProcessing(items: string[]) {
  const service = createOpenRouterService({
    defaultModel: "openai/gpt-3.5-turbo",
  });

  service.setSystemMessage("Summarize the following text in one sentence.");

  // Process in batches to avoid rate limits
  const batchSize = 5;
  const delayMs = 1000; // 1 second between batches
  const results: string[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const batchResults = await Promise.all(batch.map((item) => service.sendChatMessage<string>(item)));

    results.push(...batchResults);

    // Wait between batches (except for last batch)
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

// ================================================================================================
// Example 9: Custom Configuration Per Request
// ================================================================================================

export async function example9_dynamicConfiguration() {
  // Start with default configuration
  const service = createOpenRouterService({
    defaultModel: "openai/gpt-3.5-turbo",
  });

  // First request: factual, low temperature
  service.setModel("openai/gpt-3.5-turbo", {
    temperature: 0.1,
  });
  service.setSystemMessage("Provide factual, precise answers.");
  const factual = await service.sendChatMessage<string>("What is the capital of France?");

  // Second request: creative, high temperature
  service.setModel("openai/gpt-4", {
    temperature: 0.9,
  });
  service.setSystemMessage("Be creative and imaginative.");
  const creative = await service.sendChatMessage<string>("Describe a futuristic city.");

  return { factual, creative };
}

// ================================================================================================
// Example 10: Monitoring and Metrics Collection
// ================================================================================================

export async function example10_metricsCollection(prompts: string[]) {
  const service = createOpenRouterService();
  service.setSystemMessage("You are a helpful assistant.");

  const metrics = [];

  for (const prompt of prompts) {
    await service.sendChatMessage<string>(prompt);
    const requestMetrics = service.getLastRequestMetrics();

    if (requestMetrics) {
      metrics.push({
        prompt: prompt.substring(0, 50), // First 50 chars
        ...requestMetrics,
      });
    }
  }

  // Calculate statistics
  const avgDuration = metrics.reduce((sum, m) => sum + m.requestDuration, 0) / metrics.length;
  const totalTokens = metrics.reduce((sum, m) => sum + (m.totalTokens || 0), 0);
  const successRate = metrics.filter((m) => m.success).length / metrics.length;

  return {
    metrics,
    statistics: {
      avgDuration,
      totalTokens,
      successRate,
      totalRequests: metrics.length,
    },
  };
}
