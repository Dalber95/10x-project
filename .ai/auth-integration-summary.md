# Podsumowanie integracji autentykacji z Supabase

## ✅ Zrealizowane zadania

### 1. Middleware autentykacji
**Plik**: `src/middleware/index.ts`

**Funkcjonalność**:
- Tworzenie klienta Supabase z tokenami użytkownika z cookies
- Ustawianie sesji dla każdego requestu
- Przekierowanie niezalogowanych użytkowników do `/login`
- Przekierowanie zalogowanych użytkowników z stron auth do `/generate`
- Pomijanie middleware dla plików statycznych i API

**Kluczowe zmiany**:
```typescript
// Pobieranie tokenów z cookies
const accessToken = context.cookies.get('sb-access-token')?.value;
const refreshToken = context.cookies.get('sb-refresh-token')?.value;

// Tworzenie klienta z tokenem
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {},
  },
});

// Ustawianie sesji
if (accessToken && refreshToken) {
  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}
```

### 2. API Endpoints autentykacji

#### Login (`/api/auth/login`)
**Plik**: `src/pages/api/auth/login.ts`

**Funkcjonalność**:
- Walidacja danych za pomocą Zod
- Logowanie przez Supabase Auth (`signInWithPassword`)
- Ustawianie HttpOnly cookies z tokenami
- Obsługa błędów (nieprawidłowe dane, itp.)

**Cookies ustawiane**:
- `sb-access-token` - token dostępu (7 dni)
- `sb-refresh-token` - token odświeżania (30 dni)

#### Register (`/api/auth/register`)
**Plik**: `src/pages/api/auth/register.ts`

**Funkcjonalność**:
- Walidacja danych (email, hasło min. 8 znaków)
- Rejestracja przez Supabase Auth (`signUp`)
- Automatyczne logowanie po rejestracji
- Ustawianie cookies z tokenami

#### Logout (`/api/auth/logout`)
**Plik**: `src/pages/api/auth/logout.ts`

**Funkcjonalność**:
- Wylogowanie przez Supabase Auth (`signOut`)
- Usuwanie cookies z tokenami
- Obsługa błędów

#### Forgot Password (`/api/auth/forgot-password`)
**Plik**: `src/pages/api/auth/forgot-password.ts`

**Funkcjonalność**:
- Wysyłanie emaila z linkiem resetującym
- Supabase Auth (`resetPasswordForEmail`)
- Bezpieczna obsługa (zawsze zwraca sukces, nawet dla nieistniejących emaili)

#### Reset Password (`/api/auth/reset-password`)
**Plik**: `src/pages/api/auth/reset-password.ts`

**Funkcjonalność**:
- Sprawdzanie tokenu autoryzacji w cookies
- Aktualizacja hasła przez Supabase Auth (`updateUser`)
- Walidacja nowego hasła

### 3. Komponenty UI

#### LogoutButton
**Plik**: `src/components/LogoutButton.tsx`

**Funkcjonalność**:
- Przycisk wylogowania z ikoną
- Stan ładowania podczas wylogowania
- Toast notification po wylogowaniu
- Automatyczne przekierowanie do `/login`

**Użycie**:
```tsx
import { LogoutButton } from "@/components/LogoutButton";

<LogoutButton />
```

### 4. Integracja w aplikacji

#### Strona główna (`/`)
**Plik**: `src/pages/index.astro`

**Logika**:
```typescript
const accessToken = Astro.cookies.get('sb-access-token');
const isAuthenticated = !!accessToken?.value;

if (isAuthenticated) {
  return Astro.redirect("/generate");
} else {
  return Astro.redirect("/login");
}
```

#### Generator fiszek
**Plik**: `src/components/FlashcardGenerationView.tsx`

**Zmiana**:
- Dodano przycisk wylogowania w nagłówku
- Przycisk widoczny tylko dla zalogowanych użytkowników

## 🔐 Przepływ autentykacji

### Rejestracja
```
1. Użytkownik wypełnia formularz na /register
2. POST /api/auth/register
3. Supabase.auth.signUp(email, password)
4. Ustawienie cookies (sb-access-token, sb-refresh-token)
5. Przekierowanie do /generate
```

### Logowanie
```
1. Użytkownik wypełnia formularz na /login
2. POST /api/auth/login
3. Supabase.auth.signInWithPassword(email, password)
4. Ustawienie cookies (sb-access-token, sb-refresh-token)
5. Przekierowanie do /generate
```

### Wylogowanie
```
1. Użytkownik klika "Wyloguj się"
2. POST /api/auth/logout
3. Supabase.auth.signOut()
4. Usunięcie cookies
5. Przekierowanie do /login
```

### Odzyskiwanie hasła
```
1. Użytkownik wpisuje email na /forgot-password
2. POST /api/auth/forgot-password
3. Supabase.auth.resetPasswordForEmail(email)
4. Email z linkiem resetującym wysłany
5. Użytkownik klika link w emailu
6. Supabase automatycznie ustawia cookies z tokenem
7. Przekierowanie do /reset-password
8. Użytkownik ustawia nowe hasło
9. POST /api/auth/reset-password
10. Supabase.auth.updateUser({ password })
11. Przekierowanie do /login po 3s
```

## 🔑 Zarządzanie sesjami

### Cookies
- **sb-access-token**: Token JWT, ważny 7 dni, HttpOnly, Secure (w prod)
- **sb-refresh-token**: Token odświeżania, ważny 30 dni, HttpOnly, Secure (w prod)

### Middleware
- Odczytuje tokeny z cookies przy każdym request
- Tworzy nowego klienta Supabase z tokenem użytkownika
- Ustawia sesję przez `supabase.auth.setSession()`
- Przekazuje klienta przez `context.locals.supabase`

### API Endpoints
- Pobierają użytkownika przez `locals.supabase.auth.getUser()`
- Sprawdzają autoryzację przed wykonaniem operacji
- Zwracają 401 dla niezalogowanych użytkowników

## 📝 Ścieżki publiczne vs chronione

### Publiczne (nie wymagają logowania)
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

### Chronione (wymagają logowania)
- `/generate`
- Wszystkie inne strony (poza publicznymi i `/`)

### Wykluczone z middleware
- `/api/*` - endpointy API
- `/favicon.png` - ikona
- `/_astro/*` - pliki statyczne Astro

## 🚀 Jak to działa w praktyce

### 1. Nowy użytkownik
```
1. Wchodzi na localhost:4321
2. Middleware sprawdza: brak tokenu
3. Przekierowanie do /login
4. Klika "Zarejestruj się" → /register
5. Wypełnia formularz i klika "Utwórz konto"
6. API tworzy konto i ustawia cookies
7. Automatyczne przekierowanie do /generate
8. Może generować fiszki
```

### 2. Użytkownik powracający
```
1. Wchodzi na localhost:4321
2. Middleware sprawdza: ma token w cookies
3. Middleware tworzy klienta Supabase z tokenem
4. Przekierowanie do /generate
5. Może od razu korzystać z aplikacji
```

### 3. Zalogowany użytkownik próbuje wejść na /login
```
1. Wpisuje /login w pasku adresu
2. Middleware sprawdza: ma token
3. Automatyczne przekierowanie do /generate
4. Nie może wejść na stronę logowania będąc zalogowanym
```

## 🛠️ Konfiguracja Supabase

### Wymagane zmienne środowiskowe
```bash
SUPABASE_URL=your-project-url
SUPABASE_KEY=your-anon-key
```

### Email Templates
Supabase automatycznie wysyła emaile dla:
- **Reset hasła**: Email z magicznym linkiem
- **Potwierdzenie email** (opcjonalne)

### Redirect URLs
W ustawieniach Supabase należy dodać:
- `http://localhost:4321/reset-password` (dev)
- `https://twoja-domena.com/reset-password` (prod)

## 🐛 Rozwiązywanie problemów

### Problem: "Provider returned error"
**Przyczyna**: Middleware nie ustawia poprawnie sesji dla klienta Supabase.

**Rozwiązanie**: ✅ Naprawione poprzez:
- Tworzenie nowego klienta dla każdego requestu
- Ustawianie tokenu w nagłówkach
- Wywołanie `setSession()` z tokenami z cookies

### Problem: Użytkownik nie jest przekierowywany
**Przyczyna**: Błąd w logice middleware lub brak tokenów.

**Debug**:
```typescript
// W middleware dodaj:
console.log('Access token:', !!accessToken);
console.log('Path:', pathname);
console.log('Is authenticated:', isAuthenticated);
```

### Problem: Tokeny nie są zapisywane
**Przyczyna**: Błąd w API endpoint podczas logowania/rejestracji.

**Debug**:
```typescript
// W /api/auth/login sprawdź:
console.log('Session:', data.session);
console.log('Setting cookies...');
```

## 📋 Checklist funkcjonalności

### Frontend ✅
- [x] Formularz logowania
- [x] Formularz rejestracji
- [x] Formularz odzyskiwania hasła
- [x] Formularz resetowania hasła
- [x] Przycisk wylogowania
- [x] Walidacja wszystkich formularzy
- [x] Komunikaty błędów i sukcesu

### Backend ✅
- [x] Endpoint POST /api/auth/login
- [x] Endpoint POST /api/auth/register
- [x] Endpoint POST /api/auth/logout
- [x] Endpoint POST /api/auth/forgot-password
- [x] Endpoint POST /api/auth/reset-password
- [x] Walidacja Zod we wszystkich endpointach

### Middleware ✅
- [x] Sprawdzanie sesji
- [x] Przekierowania dla niezalogowanych
- [x] Przekierowania dla zalogowanych na strony auth
- [x] Tworzenie klienta Supabase z tokenem
- [x] Pomijanie plików statycznych i API

### Integracja ✅
- [x] Ochrona strony /generate
- [x] Dostęp do user.id w API endpoints
- [x] Działająca generacja fiszek dla zalogowanych
- [x] Działające zapisywanie fiszek dla zalogowanych

## 🎉 Status

Autentykacja jest **w pełni działająca**:
- ✅ Użytkownicy mogą się rejestrować
- ✅ Użytkownicy mogą się logować
- ✅ Użytkownicy mogą się wylogować
- ✅ Użytkownicy mogą resetować hasło
- ✅ Strony są chronione middleware
- ✅ API endpoints sprawdzają autoryzację
- ✅ Generowanie fiszek działa dla zalogowanych użytkowników
- ✅ Sesje są zachowywane w cookies (HttpOnly, Secure)

Aplikacja jest gotowa do użycia! 🚀

