import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

const RegisterSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
});

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const body = await request.json();
    const validatedData = RegisterSchema.parse(body);

    const { data, error } = await locals.supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          message:
            error.message === "User already registered" ? "Email już istnieje w systemie" : "Błąd podczas rejestracji",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Ustaw cookie z sesją (bez maxAge - sesja wygasa po zamknięciu przeglądarki)
    if (data.session) {
      cookies.set("sb-access-token", data.session.access_token, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
      });

      cookies.set("sb-refresh-token", data.session.refresh_token, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
      });
    }

    return new Response(
      JSON.stringify({
        message: "Konto utworzone pomyślnie",
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
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

    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({
        message: "Wystąpił nieoczekiwany błąd",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
