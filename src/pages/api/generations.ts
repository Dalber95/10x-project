// src/pages/api/generations.ts
import type { APIRoute } from "astro";
import { generateFlashcardsCommandSchema } from "../../lib/schemas";
import {
  generateFlashcards,
  GenerationError,
} from "../../lib/generation.service";
import type { GenerationCreateResponseDto } from "../../types";

/**
 * POST /api/generations
 * Endpoint to initiate AI flashcard generation from source text
 *
 * @requires Authentication - User must be authenticated via Supabase
 * @param source_text - Text input between 1000 and 10000 characters
 * @returns 201 - Generation successful with flashcard proposals
 * @returns 400 - Invalid input data
 * @returns 401 - Unauthorized (not authenticated)
 * @returns 500 - Server error during generation
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Step 1: Authentication check
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();

    if (authError) {
      console.error("Authentication error in /api/generations:", authError);
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Authentication failed: " + authError.message,
          details: authError,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!user) {
      console.error("No user found in /api/generations");
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be authenticated to generate flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("User authenticated in /api/generations:", user.id);

    // Step 2: Parse and validate request body
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
      generateFlashcardsCommandSchema.safeParse(requestBody);

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

    const { source_text } = validationResult.data;

    // Step 4: Generate flashcards using the service
    const result: GenerationCreateResponseDto = await generateFlashcards(
      locals.supabase,
      user.id,
      source_text,
    );

    // Step 5: Return successful response
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle known generation errors
    if (error instanceof GenerationError) {
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
    console.error("Unexpected error in POST /api/generations:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while generating flashcards",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

