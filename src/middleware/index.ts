import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Ścieżki publiczne (nie wymagają logowania)
const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

// Ścieżki do plików statycznych i API
const excludedPaths = ["/api/", "/favicon.png", "/_astro/"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Pobierz tokeny z cookies
  const accessToken = context.cookies.get("sb-access-token")?.value;
  const refreshToken = context.cookies.get("sb-refresh-token")?.value;

  // Utwórz klienta Supabase z tokenem użytkownika
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });

  // Jeśli mamy tokeny, ustaw sesję
  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  // Dodaj klienta do context.locals
  context.locals.supabase = supabase;

  // Pomiń middleware dla plików statycznych i API
  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return next();
  }

  const isAuthenticated = !!accessToken;

  // Jeśli użytkownik jest zalogowany i próbuje wejść na strony auth, przekieruj do /generate
  if (isAuthenticated && publicPaths.some((path) => pathname.startsWith(path))) {
    return context.redirect("/generate");
  }

  // Jeśli użytkownik nie jest zalogowany i próbuje wejść na chronione strony
  if (!isAuthenticated && !publicPaths.some((path) => pathname.startsWith(path))) {
    return context.redirect("/login");
  }

  return next();
});
