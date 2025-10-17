// src/lib/schemas.ts
import { z } from "zod";

/**
 * Validation schema for the GenerateFlashcardsCommand
 * Ensures source_text is between 1000 and 10000 characters
 */
export const generateFlashcardsCommandSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters")
    .max(10000, "Source text must not exceed 10000 characters"),
});

/**
 * Type inference from the schema
 */
export type GenerateFlashcardsCommandSchema = z.infer<
  typeof generateFlashcardsCommandSchema
>;

/**
 * Validation schema for a single flashcard creation
 * Ensures proper validation for front, back, source, and generation_id fields
 */
export const flashcardCreateDtoSchema = z
  .object({
    front: z
      .string()
      .min(1, "Front must not be empty")
      .max(200, "Front must not exceed 200 characters"),
    back: z
      .string()
      .min(1, "Back must not be empty")
      .max(500, "Back must not exceed 500 characters"),
    source: z.enum(["ai-full", "ai-edited", "manual"], {
      errorMap: () => ({
        message: 'Source must be one of: "ai-full", "ai-edited", "manual"',
      }),
    }),
    generation_id: z.number().nullable(),
  })
  .refine(
    (data) => {
      // For "ai-full" and "ai-edited", generation_id must be a number (not null)
      if (data.source === "ai-full" || data.source === "ai-edited") {
        return data.generation_id !== null;
      }
      // For "manual", generation_id must be null
      if (data.source === "manual") {
        return data.generation_id === null;
      }
      return true;
    },
    {
      message:
        'generation_id is required for "ai-full" and "ai-edited" sources, and must be null for "manual" source',
      path: ["generation_id"],
    },
  );

/**
 * Validation schema for the FlashcardsCreateCommand
 * Ensures the request contains a valid array of flashcards
 */
export const flashcardsCreateCommandSchema = z.object({
  flashcards: z
    .array(flashcardCreateDtoSchema)
    .min(1, "At least one flashcard is required")
    .max(50, "Cannot create more than 50 flashcards at once"),
});

/**
 * Validation schema for flashcard update
 * All fields are optional (partial update)
 */
export const flashcardUpdateDtoSchema = z
  .object({
    front: z
      .string()
      .min(1, "Front must not be empty")
      .max(200, "Front must not exceed 200 characters")
      .optional(),
    back: z
      .string()
      .min(1, "Back must not be empty")
      .max(500, "Back must not exceed 500 characters")
      .optional(),
    source: z
      .enum(["ai-full", "ai-edited", "manual"], {
        errorMap: () => ({
          message: 'Source must be one of: "ai-full", "ai-edited", "manual"',
        }),
      })
      .optional(),
    generation_id: z.number().nullable().optional(),
  })
  .refine(
    (data) => {
      // If source is being updated to "ai-full" or "ai-edited", generation_id should be provided and not null
      if (
        data.source &&
        (data.source === "ai-full" || data.source === "ai-edited")
      ) {
        // If generation_id is explicitly set in the update, it must not be null
        if (data.generation_id !== undefined && data.generation_id === null) {
          return false;
        }
      }
      // If source is being updated to "manual", generation_id should be null
      if (data.source === "manual" && data.generation_id !== undefined) {
        return data.generation_id === null;
      }
      return true;
    },
    {
      message:
        'generation_id should be a number for "ai-full" and "ai-edited" sources, and null for "manual" source',
      path: ["generation_id"],
    },
  );

/**
 * Type inference from the schemas
 */
export type FlashcardCreateDtoSchema = z.infer<
  typeof flashcardCreateDtoSchema
>;
export type FlashcardsCreateCommandSchema = z.infer<
  typeof flashcardsCreateCommandSchema
>;
export type FlashcardUpdateDtoSchema = z.infer<
  typeof flashcardUpdateDtoSchema
>;
