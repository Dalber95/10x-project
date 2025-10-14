import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

const ForgotPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const validatedData = ForgotPasswordSchema.parse(body);

    const { error } = await locals.supabase.auth.resetPasswordForEmail(
      validatedData.email,
      {
        redirectTo: `${new URL(request.url).origin}/reset-password`,
      }
    );

    if (error) {
      // Dla bezpieczeństwa, zawsze zwracamy sukces, nawet jeśli email nie istnieje
      // To zapobiega atakom enumeracji użytkowników
      console.error("Password reset error:", error);
    }

    return new Response(
      JSON.stringify({
        message: "Link do resetowania hasła został wysłany",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          message: error.errors[0].message,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.error("Forgot password error:", error);
    return new Response(
      JSON.stringify({
        message: "Wystąpił nieoczekiwany błąd",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

