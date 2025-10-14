# Konfiguracja OpenRouter API

## 📋 Wymagania

Aby używać prawdziwego AI do generowania fiszek, potrzebujesz:
1. Konto na https://openrouter.ai
2. Klucz API z OpenRouter
3. Plik `.env` z poprawnie skonfigurowanym kluczem

## 🔑 Jak zdobyć klucz API

### Krok 1: Utwórz konto
1. Wejdź na https://openrouter.ai
2. Kliknij "Sign In" lub "Get Started"
3. Zaloguj się przez Google/GitHub lub utwórz konto

### Krok 2: Wygeneruj klucz API
1. Po zalogowaniu wejdź na https://openrouter.ai/keys
2. Kliknij "Create Key"
3. Nazwij klucz (np. "10xCards Development")
4. Skopiuj wygenerowany klucz (zaczyna się od `sk-or-v1-`)

### Krok 3: Dodaj kredyty (opcjonalnie)
OpenRouter oferuje:
- **Free tier**: Niektóre modele są darmowe (np. `google/gemini-flash-1.5`)
- **Pay-as-you-go**: Płacisz tylko za użycie
- **Kredyty**: Możesz dodać $5-10 na start

> **Tip**: Dla rozwoju użyj tanich modeli jak `google/gemini-flash-1.5` (~$0.001 za request)

## ⚙️ Konfiguracja pliku `.env`

### Krok 1: Utwórz plik `.env`
W głównym katalogu projektu:

```bash
# PowerShell
Copy-Item .env.example .env

# lub ręcznie utwórz plik .env
```

### Krok 2: Wypełnij zmienne

```env
# Supabase Configuration
SUPABASE_URL=https://twoj-projekt.supabase.co
SUPABASE_KEY=twoj-supabase-anon-key

# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-twoj-klucz-tutaj
```

### Przykład poprawnego `.env`:

```env
SUPABASE_URL=https://abc123xyz.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENROUTER_API_KEY=sk-or-v1-1234567890abcdef1234567890abcdef1234567890abcdef
```

## 🚀 Uruchomienie

### Krok 1: Zrestartuj dev server

**WAŻNE**: Astro nie przeładowuje automatycznie zmiennych środowiskowych!

```bash
# W terminalu gdzie działa npm run dev:
# Naciśnij Ctrl+C aby zatrzymać server

# Uruchom ponownie:
npm run dev
```

### Krok 2: Sprawdź logi

Po restarcie, w terminalu powinieneś zobaczyć:

```
🔑 OpenRouter API Key check: {
  hasConfigKey: false,
  hasEnvKey: true,           ← To powinno być TRUE
  keyLength: 64,             ← Długość klucza (ok. 60-70 znaków)
  keyPrefix: 'sk-or-v1-1...'
}
```

### Krok 3: Testuj generowanie

1. Zaloguj się w aplikacji
2. Wklej tekst (min. 100 znaków)
3. Kliknij "Generuj fiszki"
4. Poczekaj 5-10 sekund

**Sukces**: Zobaczysz fiszki wygenerowane przez AI! ✅

## 🐛 Rozwiązywanie problemów

### Problem 1: "OpenRouter API key is required"

**Objawy**:
```
❌ OpenRouter error: {
  message: 'OpenRouter API key is required',
  code: 'AUTHENTICATION_ERROR',
  statusCode: 401
}
```

**Rozwiązanie**:
1. Sprawdź czy plik `.env` istnieje w głównym katalogu
2. Sprawdź czy zmienna nazywa się **dokładnie** `OPENROUTER_API_KEY`
3. Sprawdź czy klucz jest poprawnie skopiowany (bez spacji na początku/końcu)
4. **ZRESTARTUJ dev server** (Ctrl+C → npm run dev)

### Problem 2: Nadal używa mocków

**Objawy**:
```
🎭 Using mock flashcards (no OpenRouter API key found)
```

**Rozwiązanie**:
1. Sprawdź logi czy `hasEnvKey: true`
2. Jeśli `hasEnvKey: false`:
   - Sprawdź pisownię: `OPENROUTER_API_KEY` (nie `OPENROUTER_KEY` ani `OPEN_ROUTER_API_KEY`)
   - Sprawdź czy plik `.env` jest w głównym katalogu (nie w `src/`)
   - Zrestartuj dev server

### Problem 3: "Invalid API key" (401)

**Objawy**:
```
❌ OpenRouter error: {
  message: 'Invalid API key',
  code: 'AUTHENTICATION_ERROR',
  statusCode: 401
}
```

**Rozwiązanie**:
1. Sprawdź czy klucz jest aktywny na https://openrouter.ai/keys
2. Wygeneruj nowy klucz i zaktualizuj `.env`
3. Upewnij się że klucz zaczyna się od `sk-or-v1-`
4. Zrestartuj dev server

### Problem 4: "Rate limit exceeded" (429)

**Objawy**:
```
❌ OpenRouter error: {
  message: 'API rate limit exceeded',
  code: 'RATE_LIMIT_ERROR',
  statusCode: 429
}
```

**Rozwiązanie**:
1. Poczekaj kilka minut
2. Dodaj kredyty na konto OpenRouter
3. Użyj tańszego modelu (edytuj `src/lib/generation.service.ts` linijka 15):
   ```typescript
   MODEL: "google/gemini-flash-1.5", // Zamiast "openai/gpt-3.5-turbo"
   ```

### Problem 5: "Insufficient credits"

**Objawy**: Błąd o braku środków

**Rozwiązanie**:
1. Wejdź na https://openrouter.ai/credits
2. Dodaj kredyty (min. $1-5)
3. Lub użyj darmowych modeli (edytuj MODEL w generation.service.ts)

### Problem 6: Timeout

**Objawy**:
```
❌ OpenRouter error: {
  message: 'Request timeout',
  code: 'TIMEOUT_ERROR',
  statusCode: 504
}
```

**Rozwiązanie**:
1. Zwiększ timeout w `src/lib/generation.service.ts` (linijka 16):
   ```typescript
   TIMEOUT_MS: 120000, // 2 minuty zamiast 1
   ```
2. Użyj szybszego modelu
3. Sprawdź połączenie internetowe

## 📊 Debug Checklist

Gdy coś nie działa, sprawdź po kolei:

### 1. Zmienne środowiskowe
```bash
# W PowerShell w katalogu projektu:
Get-Content .env
```

**Powinieneś zobaczyć**:
```
SUPABASE_URL=https://...
SUPABASE_KEY=eyJ...
OPENROUTER_API_KEY=sk-or-v1-...
```

### 2. Logi w terminalu (dev server)

**Szukaj**:
```
🔑 OpenRouter API Key check:
```

**Sprawdź**:
- `hasEnvKey` powinno być `true`
- `keyLength` powinno być > 50
- `keyPrefix` powinno zaczynać się od `sk-or-v1-`

### 3. Logi w przeglądarce

**DevTools → Console (F12)**

Szukaj błędów podczas generowania fiszek.

### 4. Network Tab

**DevTools → Network → Filtr: "generations"**

Sprawdź response z `/api/generations`:
- Status 201 = Sukces ✅
- Status 401 = Problem z auth
- Status 500 = Błąd serwera (sprawdź logi terminala)

## 🎯 Rekomendowane modele

### Dla rozwoju (tanie/szybkie):
```typescript
MODEL: "google/gemini-flash-1.5"
MODEL: "meta-llama/llama-3.2-3b-instruct:free"
MODEL: "mistralai/mistral-7b-instruct:free"
```

### Dla produkcji (lepsze wyniki):
```typescript
MODEL: "openai/gpt-3.5-turbo"
MODEL: "openai/gpt-4-turbo"
MODEL: "anthropic/claude-3-haiku"
```

### Zmiana modelu:

Edytuj `src/lib/generation.service.ts`:
```typescript
const GENERATION_CONFIG = {
  MODEL: "google/gemini-flash-1.5", // ← Zmień tutaj
  TIMEOUT_MS: 60000,
  USE_MOCK: import.meta.env.DEV && !import.meta.env.OPENROUTER_API_KEY,
} as const;
```

Zrestartuj dev server.

## 💡 Wskazówki

1. **Testuj na małych tekstach** (100-300 znaków) aby oszczędzać kredyty
2. **Monitoruj koszty** na https://openrouter.ai/activity
3. **Używaj tanich modeli** podczas developmentu
4. **Zawsze restartuj server** po zmianie `.env`
5. **Sprawdzaj logi** w terminalu przy każdym generowaniu

## 📞 Dalsze wsparcie

Jeśli nadal nie działa:

1. **Sprawdź logi** z sekcji Debug Checklist
2. **Zrób screenshot** błędu z terminala
3. **Sprawdź** czy `.env` nie jest w `.gitignore` (powinien być!)
4. **Sprawdź** dokumentację OpenRouter: https://openrouter.ai/docs

---

**Status po konfiguracji**: ✅ OpenRouter API powinno działać!

