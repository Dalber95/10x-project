// src/pages/api/flashcards/[id].ts
import type { APIRoute } from "astro";
import { flashcardUpdateDtoSchema } from "../../../lib/schemas";
import {
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
  FlashcardError,
} from "../../../lib/flashcard.service";

/**
 * GET /api/flashcards/:id
 * Endpoint to retrieve a single flashcard by ID
 *
 * @requires Authentication - User must be authenticated via Supabase
 * @param id - Flashcard ID from URL params
 * @returns 200 - Flashcard data
 * @returns 401 - Unauthorized (not authenticated)
 * @returns 404 - Flashcard not found
 * @returns 500 - Server error during retrieval
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Step 1: Authentication check
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to view flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Step 2: Validate ID parameter
    const flashcardId = parseInt(params.id ?? "", 10);

    if (isNaN(flashcardId)) {
      return new Response(
        JSON.stringify({
          error: "Invalid Parameter",
          message: "Flashcard ID must be a valid number",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Step 3: Fetch flashcard using the service
    const flashcard = await getFlashcardById(
      locals.supabase,
      user.id,
      flashcardId,
    );

    // Step 4: Return successful response
    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle known flashcard errors
    if (error instanceof FlashcardError) {
      return new Response(
        JSON.stringify({
          error: error.code,
          message: error.message,
        }),
        {
          status: error.statusCode,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Handle unexpected errors
    console.error("Unexpected error in GET /api/flashcards/:id:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while fetching the flashcard",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

/**
 * PUT /api/flashcards/:id
 * Endpoint to update a flashcard
 *
 * @requires Authentication - User must be authenticated via Supabase
 * @param id - Flashcard ID from URL params
 * @param body - Partial flashcard update data
 * @returns 200 - Updated flashcard data
 * @returns 400 - Invalid input data
 * @returns 401 - Unauthorized (not authenticated)
 * @returns 404 - Flashcard not found
 * @returns 500 - Server error during update
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    // Step 1: Authentication check
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to update flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Step 2: Validate ID parameter
    const flashcardId = parseInt(params.id ?? "", 10);

    if (isNaN(flashcardId)) {
      return new Response(
        JSON.stringify({
          error: "Invalid Parameter",
          message: "Flashcard ID must be a valid number",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Step 3: Parse request body
    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON",
          message: "Request body must be valid JSON",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Step 4: Validate against schema
    const validationResult = flashcardUpdateDtoSchema.safeParse(requestBody);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return new Response(
        JSON.stringify({
          error: "Validation Error",
          message: "Invalid input data",
          details: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Step 5: Update flashcard using the service
    const updatedFlashcard = await updateFlashcard(
      locals.supabase,
      user.id,
      flashcardId,
      validationResult.data,
    );

    // Step 6: Return successful response
    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle known flashcard errors
    if (error instanceof FlashcardError) {
      return new Response(
        JSON.stringify({
          error: error.code,
          message: error.message,
        }),
        {
          status: error.statusCode,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Handle unexpected errors
    console.error("Unexpected error in PUT /api/flashcards/:id:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while updating the flashcard",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

/**
 * DELETE /api/flashcards/:id
 * Endpoint to delete a flashcard
 *
 * @requires Authentication - User must be authenticated via Supabase
 * @param id - Flashcard ID from URL params
 * @returns 204 - Flashcard deleted successfully
 * @returns 401 - Unauthorized (not authenticated)
 * @returns 404 - Flashcard not found
 * @returns 500 - Server error during deletion
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Step 1: Authentication check
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to delete flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Step 2: Validate ID parameter
    const flashcardId = parseInt(params.id ?? "", 10);

    if (isNaN(flashcardId)) {
      return new Response(
        JSON.stringify({
          error: "Invalid Parameter",
          message: "Flashcard ID must be a valid number",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Step 3: Delete flashcard using the service
    await deleteFlashcard(locals.supabase, user.id, flashcardId);

    // Step 4: Return successful response (204 No Content)
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // Handle known flashcard errors
    if (error instanceof FlashcardError) {
      return new Response(
        JSON.stringify({
          error: error.code,
          message: error.message,
        }),
        {
          status: error.statusCode,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Handle unexpected errors
    console.error("Unexpected error in DELETE /api/flashcards/:id:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while deleting the flashcard",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

