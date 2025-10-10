// src/lib/flashcard.service.ts
import type { SupabaseClient } from "../db/supabase.client";
import type { FlashcardCreateDto, FlashcardDto } from "../types";

/**
 * Custom error class for flashcard operations
 */
export class FlashcardError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "FlashcardError";
  }
}

/**
 * Verifies that the generation_id exists and belongs to the user
 */
async function verifyGenerationOwnership(
  supabase: SupabaseClient,
  userId: string,
  generationId: number,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("generations")
    .select("id")
    .eq("id", generationId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

/**
 * Creates one or more flashcards in the database
 * Validates generation ownership for AI-generated flashcards
 *
 * @param supabase - Supabase client instance
 * @param userId - ID of the authenticated user
 * @param flashcardsData - Array of flashcard data to create
 * @returns Array of created flashcard DTOs
 * @throws FlashcardError if validation or database operations fail
 */
export async function createFlashcards(
  supabase: SupabaseClient,
  userId: string,
  flashcardsData: FlashcardCreateDto[],
): Promise<FlashcardDto[]> {
  // Step 1: Validate generation_id ownership for AI-generated flashcards
  const generationIds = new Set(
    flashcardsData
      .filter(
        (fc) =>
          fc.generation_id !== null &&
          (fc.source === "ai-full" || fc.source === "ai-edited"),
      )
      .map((fc) => fc.generation_id as number),
  );

  // Verify each unique generation_id belongs to the user
  for (const genId of generationIds) {
    const isValid = await verifyGenerationOwnership(supabase, userId, genId);
    if (!isValid) {
      throw new FlashcardError(
        `Generation with id ${genId} not found or does not belong to the user`,
        "INVALID_GENERATION_ID",
        400,
      );
    }
  }

  // Step 2: Prepare flashcards for batch insert
  const flashcardsToInsert = flashcardsData.map((fc) => ({
    user_id: userId,
    front: fc.front,
    back: fc.back,
    source: fc.source,
    generation_id: fc.generation_id,
  }));

  // Step 3: Perform batch insert
  const { data, error } = await supabase
    .from("flashcards")
    .insert(flashcardsToInsert)
    .select(
      "id, front, back, source, generation_id, created_at, updated_at",
    );

  if (error) {
    console.error("Database error while creating flashcards:", error);
    throw new FlashcardError(
      "Failed to create flashcards in database",
      "DATABASE_ERROR",
      500,
    );
  }

  if (!data || data.length === 0) {
    throw new FlashcardError(
      "No flashcards were created",
      "CREATION_FAILED",
      500,
    );
  }

  // Step 4: Return created flashcards as DTOs
  return data as FlashcardDto[];
}

