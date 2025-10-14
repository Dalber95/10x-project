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

    // Usuń cookies (z różnymi opcjami, aby upewnić się, że są usunięte)
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });
    
    // Alternatywnie ustaw je na pusty ciąg z natychmiastowym wygaśnięciem
    cookies.set("sb-access-token", "", { 
      path: "/", 
      maxAge: 0,
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
    });
    cookies.set("sb-refresh-token", "", { 
      path: "/", 
      maxAge: 0,
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
    });

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

