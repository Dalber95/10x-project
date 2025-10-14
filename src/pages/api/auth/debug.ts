import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    // Sprawdź użytkownika
    const { data: { user }, error: userError } = await locals.supabase.auth.getUser();
    
    // Sprawdź sesję
    const { data: { session }, error: sessionError } = await locals.supabase.auth.getSession();

    return new Response(
      JSON.stringify({
        cookies: {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          accessTokenLength: accessToken?.length || 0,
        },
        user: user ? {
          id: user.id,
          email: user.email,
        } : null,
        userError: userError?.message || null,
        session: session ? {
          expiresAt: session.expires_at,
        } : null,
        sessionError: sessionError?.message || null,
      }, null, 2),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }, null, 2),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
};

