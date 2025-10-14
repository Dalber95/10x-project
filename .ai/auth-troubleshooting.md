# Rozwiązywanie problemów z autentykacją

## Debugging endpoint

Stworzyłem endpoint debugowania: **GET `/api/auth/debug`**

### Jak użyć:
1. Zaloguj się w aplikacji (`/login`)
2. Otwórz w przeglądarce: `http://localhost:4321/api/auth/debug`
3. Sprawdź odpowiedź JSON

### Przykładowa poprawna odpowiedź:
```json
{
  "cookies": {
    "hasAccessToken": true,
    "hasRefreshToken": true,
    "accessTokenLength": 500
  },
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  },
  "userError": null,
  "session": {
    "expiresAt": 1234567890
  },
  "sessionError": null
}
```

### Jeśli coś jest nie tak:
```json
{
  "cookies": {
    "hasAccessToken": false,  // ❌ Problem: brak tokenu
    "hasRefreshToken": false,
    "accessTokenLength": 0
  },
  "user": null,
  "userError": "Invalid token",  // ❌ Problem: token nieprawidłowy
  "session": null,
  "sessionError": "No session found"
}
```

## Częste problemy

### Problem 1: "Provider returned error"

**Objawy**: Błąd podczas generowania fiszek

**Możliwe przyczyny**:
1. Tokeny nie są zapisywane w cookies
2. Middleware nie ustawia sesji
3. Supabase zwraca błąd autoryzacji

**Kroki debugowania**:

#### Krok 1: Sprawdź czy tokeny są w cookies
1. Otwórz DevTools (F12)
2. Zakładka "Application" → "Cookies"
3. Sprawdź czy istnieją:
   - `sb-access-token`
   - `sb-refresh-token`

**Jeśli brak cookies**:
- Problem w `/api/auth/login` lub `/api/auth/register`
- Sprawdź console.log w tych endpointach
- Upewnij się że Supabase zwraca session

#### Krok 2: Sprawdź endpoint debug
```bash
curl http://localhost:4321/api/auth/debug -H "Cookie: sb-access-token=YOUR_TOKEN"
```

**Jeśli zwraca błąd**:
- Token jest nieprawidłowy lub wygasły
- Wyloguj się i zaloguj ponownie

#### Krok 3: Sprawdź logi serwera
Szukaj w konsoli:
```
Authentication error in /api/generations: [błąd]
User authenticated in /api/generations: [user-id]
```

**Jeśli widzisz "Authentication error"**:
- Problem z ustawieniem sesji w middleware
- Sprawdź czy middleware działa poprawnie

### Problem 2: Nie mogę się zalogować

**Objawy**: "Nieprawidłowy email lub hasło"

**Możliwe przyczyny**:
1. Błędne dane logowania
2. Użytkownik nie istnieje w Supabase
3. Problem z Supabase Auth

**Kroki debugowania**:

#### Krok 1: Sprawdź Supabase Dashboard
1. Otwórz https://app.supabase.com
2. Wybierz swój projekt
3. Authentication → Users
4. Sprawdź czy użytkownik istnieje

#### Krok 2: Sprawdź logi w terminalu
Po próbie logowania szukaj błędów w konsoli dev servera

#### Krok 3: Testuj API bezpośrednio
```bash
curl -X POST http://localhost:4321/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'
```

### Problem 3: Przekierowania nie działają

**Objawy**: Strona się nie przekierowuje lub przekierowuje w pętli

**Możliwe przyczyny**:
1. Middleware się zapętla
2. Cookies nie są odczytywane
3. Problem z logiką przekierowań

**Kroki debugowania**:

#### Krok 1: Dodaj logi w middleware
```typescript
// W src/middleware/index.ts
console.log('Pathname:', pathname);
console.log('Has access token:', !!accessToken);
console.log('Is authenticated:', isAuthenticated);
```

#### Krok 2: Sprawdź czy ścieżka jest poprawnie wykrywana
- Publiczne ścieżki powinny być dostępne bez logowania
- Chronione ścieżki powinny przekierowywać do /login

### Problem 4: "Invalid login credentials"

**Objawy**: Błąd z Supabase podczas logowania

**Możliwe przyczyny**:
1. Hasło jest nieprawidłowe
2. Email nie istnieje w bazie
3. Konto nie zostało zweryfikowane

**Rozwiązanie**:
1. Upewnij się że utworzyłeś konto przez `/register`
2. Sprawdź czy Supabase wymaga potwierdzenia email
3. W Supabase Dashboard → Authentication → Settings sprawdź:
   - "Enable email confirmations" może być wyłączone dla dev

### Problem 5: Tokeny wygasają zbyt szybko

**Objawy**: Użytkownik jest wylogowywany po kilku minutach

**Możliwe przyczyny**:
1. Access token wygasł (domyślnie 1h)
2. Brak mechanizmu refresh token

**Rozwiązanie** (TODO - do implementacji):
```typescript
// W middleware dodać refresh token logic
if (accessToken && refreshToken) {
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });
  
  if (data.session) {
    // Zaktualizuj cookies z nowym tokenem
    context.cookies.set('sb-access-token', data.session.access_token, {/*...*/});
  }
}
```

## Checklist debugowania

Gdy coś nie działa, sprawdź po kolei:

### Frontend
- [ ] Formularz wysyła poprawne dane
- [ ] Console nie pokazuje błędów JavaScript
- [ ] Network tab pokazuje request do API
- [ ] Response z API zawiera błąd (sprawdź message)

### Cookies
- [ ] Cookies są ustawiane po logowaniu (Application → Cookies)
- [ ] Cookies mają prawidłowe atrybuty (HttpOnly, Path="/")
- [ ] Cookies są wysyłane z requestami (Network → Headers → Cookie)

### API Endpoints
- [ ] Endpoint `/api/auth/login` zwraca 200 i session
- [ ] Endpoint `/api/auth/debug` pokazuje user i session
- [ ] Endpoint `/api/generations` zwraca user.id w logach

### Middleware
- [ ] Middleware wykonuje się (dodaj console.log)
- [ ] Cookies są odczytywane (sprawdź accessToken)
- [ ] Sesja jest ustawiana (setSession wywołane)
- [ ] Klient Supabase ma token w headers

### Supabase
- [ ] Zmienne środowiskowe są ustawione (SUPABASE_URL, SUPABASE_KEY)
- [ ] Projekt Supabase jest aktywny
- [ ] Auth jest włączony w projekcie
- [ ] Rate limiting nie blokuje requestów

## Narzędzia debugowania

### 1. Browser DevTools
```javascript
// W konsoli przeglądarki sprawdź cookies:
document.cookie

// Sprawdź local storage:
localStorage

// Sprawdź session storage:
sessionStorage
```

### 2. Network Tab
- Włącz "Preserve log"
- Filtruj po "api/auth"
- Sprawdź Headers i Response dla każdego requestu

### 3. Supabase Dashboard
- Real-time logs w Authentication → Logs
- Lista użytkowników w Authentication → Users
- Konfiguracja w Authentication → Settings

### 4. Terminal/Console
Szukaj w logach serwera:
```
"Authentication error"
"User authenticated"
"Provider returned error"
```

## Jak zgłosić błąd

Jeśli problem nadal występuje, zbierz informacje:

1. **Endpoint debug**:
```bash
curl http://localhost:4321/api/auth/debug
```

2. **Logi z konsoli przeglądarki** (F12 → Console)

3. **Logi z terminala** (gdzie uruchomiony jest `npm run dev`)

4. **Request/Response z Network tab**:
   - Request URL
   - Request Headers (usuń tokeny!)
   - Response Headers
   - Response Body

5. **Zmienne środowiskowe** (bez wartości!):
```bash
echo "SUPABASE_URL is set: $([[ -n "$SUPABASE_URL" ]] && echo "yes" || echo "no")"
```

## Częste rozwiązania

### Reset wszystkiego
```bash
# 1. Wyloguj się w przeglądarce
# 2. Wyczyść cookies (DevTools → Application → Clear site data)
# 3. Zrestartuj dev server (Ctrl+C, npm run dev)
# 4. Zarejestruj nowe konto
```

### Sprawdź zmienne środowiskowe
```bash
# W terminalu
cat .env
# lub
echo $SUPABASE_URL
```

### Testuj bez middleware
Tymczasowo wyłącz middleware (zakomentuj przekierowania) i testuj API bezpośrednio.

## Kontakt

Jeśli żaden z powyższych kroków nie pomógł, dołącz informacje z sekcji "Jak zgłosić błąd" do zgłoszenia.

