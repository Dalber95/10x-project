// src/lib/flashcard.service.ts
import type { SupabaseClient } from "../db/supabase.client";
import type { FlashcardCreateDto, FlashcardDto, FlashcardUpdateDto, FlashcardsListResponseDto } from "../types";

/**
 * Custom error class for flashcard operations
 */
export class FlashcardError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500
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
  generationId: number
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
  flashcardsData: FlashcardCreateDto[]
): Promise<FlashcardDto[]> {
  // Step 1: Validate generation_id ownership for AI-generated flashcards
  const generationIds = new Set(
    flashcardsData
      .filter((fc) => fc.generation_id !== null && (fc.source === "ai-full" || fc.source === "ai-edited"))
      .map((fc) => fc.generation_id as number)
  );

  // Verify each unique generation_id belongs to the user
  for (const genId of generationIds) {
    const isValid = await verifyGenerationOwnership(supabase, userId, genId);
    if (!isValid) {
      throw new FlashcardError(
        `Generation with id ${genId} not found or does not belong to the user`,
        "INVALID_GENERATION_ID",
        400
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
    .select("id, front, back, source, generation_id, created_at, updated_at");

  if (error) {
    console.error("Database error while creating flashcards:", error);
    throw new FlashcardError("Failed to create flashcards in database", "DATABASE_ERROR", 500);
  }

  if (!data || data.length === 0) {
    throw new FlashcardError("No flashcards were created", "CREATION_FAILED", 500);
  }

  // Step 4: Return created flashcards as DTOs
  return data as FlashcardDto[];
}

/**
 * Retrieves a paginated list of flashcards for a user
 *
 * @param supabase - Supabase client instance
 * @param userId - ID of the authenticated user
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Paginated list of flashcards with metadata
 * @throws FlashcardError if database operations fail
 */
export async function getFlashcards(
  supabase: SupabaseClient,
  userId: string,
  page = 1,
  limit = 20
): Promise<FlashcardsListResponseDto> {
  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Fetch total count
  const { count, error: countError } = await supabase
    .from("flashcards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    console.error("Database error while counting flashcards:", countError);
    throw new FlashcardError("Failed to count flashcards", "DATABASE_ERROR", 500);
  }

  const total = count ?? 0;

  // Fetch paginated flashcards
  const { data, error } = await supabase
    .from("flashcards")
    .select("id, front, back, source, generation_id, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Database error while fetching flashcards:", error);
    throw new FlashcardError("Failed to fetch flashcards from database", "DATABASE_ERROR", 500);
  }

  return {
    data: (data as FlashcardDto[]) ?? [],
    pagination: {
      page,
      limit,
      total,
    },
  };
}

/**
 * Retrieves a single flashcard by ID
 *
 * @param supabase - Supabase client instance
 * @param userId - ID of the authenticated user
 * @param flashcardId - ID of the flashcard to retrieve
 * @returns Flashcard DTO
 * @throws FlashcardError if flashcard not found or doesn't belong to user
 */
export async function getFlashcardById(
  supabase: SupabaseClient,
  userId: string,
  flashcardId: number
): Promise<FlashcardDto> {
  const { data, error } = await supabase
    .from("flashcards")
    .select("id, front, back, source, generation_id, created_at, updated_at")
    .eq("id", flashcardId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new FlashcardError("Flashcard not found or does not belong to the user", "FLASHCARD_NOT_FOUND", 404);
  }

  return data as FlashcardDto;
}

/**
 * Updates a flashcard
 *
 * @param supabase - Supabase client instance
 * @param userId - ID of the authenticated user
 * @param flashcardId - ID of the flashcard to update
 * @param updateData - Fields to update
 * @returns Updated flashcard DTO
 * @throws FlashcardError if flashcard not found, validation fails, or database operation fails
 */
export async function updateFlashcard(
  supabase: SupabaseClient,
  userId: string,
  flashcardId: number,
  updateData: FlashcardUpdateDto
): Promise<FlashcardDto> {
  // First verify the flashcard exists and belongs to the user
  await getFlashcardById(supabase, userId, flashcardId);

  // If updating generation_id for AI sources, verify ownership
  if (
    updateData.generation_id !== undefined &&
    updateData.generation_id !== null &&
    updateData.source &&
    (updateData.source === "ai-full" || updateData.source === "ai-edited")
  ) {
    const isValid = await verifyGenerationOwnership(supabase, userId, updateData.generation_id);
    if (!isValid) {
      throw new FlashcardError(
        `Generation with id ${updateData.generation_id} not found or does not belong to the user`,
        "INVALID_GENERATION_ID",
        400
      );
    }
  }

  // Perform the update
  const { data, error } = await supabase
    .from("flashcards")
    .update(updateData)
    .eq("id", flashcardId)
    .eq("user_id", userId)
    .select("id, front, back, source, generation_id, created_at, updated_at")
    .single();

  if (error || !data) {
    console.error("Database error while updating flashcard:", error);
    throw new FlashcardError("Failed to update flashcard", "DATABASE_ERROR", 500);
  }

  return data as FlashcardDto;
}

/**
 * Deletes a flashcard
 *
 * @param supabase - Supabase client instance
 * @param userId - ID of the authenticated user
 * @param flashcardId - ID of the flashcard to delete
 * @throws FlashcardError if flashcard not found or database operation fails
 */
export async function deleteFlashcard(supabase: SupabaseClient, userId: string, flashcardId: number): Promise<void> {
  // First verify the flashcard exists and belongs to the user
  await getFlashcardById(supabase, userId, flashcardId);

  // Perform the deletion
  const { error } = await supabase.from("flashcards").delete().eq("id", flashcardId).eq("user_id", userId);

  if (error) {
    console.error("Database error while deleting flashcard:", error);
    throw new FlashcardError("Failed to delete flashcard", "DATABASE_ERROR", 500);
  }
}
