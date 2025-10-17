// src/pages/api/flashcards.ts
import type { APIRoute } from "astro";
import { flashcardsCreateCommandSchema } from "../../lib/schemas";
import {
  createFlashcards,
  getFlashcards,
  FlashcardError,
} from "../../lib/flashcard.service";

/**
 * POST /api/flashcards
 * Endpoint to create one or more flashcards
 *
 * @requires Authentication - User must be authenticated via Supabase
 * @param flashcards - Array of flashcard objects with front, back, source, and generation_id
 * @returns 201 - Flashcards created successfully
 * @returns 400 - Invalid input data or generation_id
 * @returns 401 - Unauthorized (not authenticated)
 * @returns 500 - Server error during creation
 */
export const POST: APIRoute = async ({ request, locals }) => {
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
          message: "You must be authenticated to create flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Step 2: Parse request body
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

    // Step 3: Validate against schema
    const validationResult =
      flashcardsCreateCommandSchema.safeParse(requestBody);

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

    const { flashcards } = validationResult.data;

    // Step 4: Create flashcards using the service
    const createdFlashcards = await createFlashcards(
      locals.supabase,
      user.id,
      flashcards,
    );

    // Step 5: Return successful response
    return new Response(
      JSON.stringify({
        flashcards: createdFlashcards,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
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
    console.error("Unexpected error in POST /api/flashcards:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while creating flashcards",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

/**
 * GET /api/flashcards
 * Endpoint to retrieve paginated list of flashcards
 *
 * @requires Authentication - User must be authenticated via Supabase
 * @param page - Query parameter for page number (default: 1)
 * @param limit - Query parameter for items per page (default: 20, max: 100)
 * @returns 200 - Paginated list of flashcards
 * @returns 401 - Unauthorized (not authenticated)
 * @returns 500 - Server error during retrieval
 */
export const GET: APIRoute = async ({ request, locals }) => {
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

    // Step 2: Parse query parameters
    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 20;

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return new Response(
        JSON.stringify({
          error: "Invalid Parameter",
          message: "Page must be a positive integer",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({
          error: "Invalid Parameter",
          message: "Limit must be between 1 and 100",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Step 3: Fetch flashcards using the service
    const result = await getFlashcards(locals.supabase, user.id, page, limit);

    // Step 4: Return successful response
    return new Response(JSON.stringify(result), {
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
    console.error("Unexpected error in GET /api/flashcards:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while fetching flashcards",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

