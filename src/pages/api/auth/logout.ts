import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ locals, cookies }) => {
  try {
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          message: "Błąd podczas wylogowania",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Usuń cookies
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });

    return new Response(
      JSON.stringify({
        message: "Wylogowano pomyślnie",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({
        message: "Wystąpił nieoczekiwany błąd",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

