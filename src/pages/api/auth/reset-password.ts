import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
});

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const body = await request.json();
    const validatedData = ResetPasswordSchema.parse(body);

    // Pobierz token z cookies (Supabase ustawia go automatycznie po kliknięciu w link)
    const accessToken = cookies.get("sb-access-token")?.value;

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          message: "Brak autoryzacji. Link resetujący może być nieprawidłowy lub wygasły.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Zaktualizuj hasło
    const { error } = await locals.supabase.auth.updateUser({
      password: validatedData.password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          message: "Błąd podczas resetowania hasła. Spróbuj ponownie.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Hasło zostało pomyślnie zresetowane",
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

    console.error("Reset password error:", error);
    return new Response(
      JSON.stringify({
        message: "Wystąpił nieoczekiwany błąd",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
