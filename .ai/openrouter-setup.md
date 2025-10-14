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
- **Free tier**: Niektóre modele są darmowe (np. `meta-llama/llama-3.2-3b-instruct:free`, `deepseek/deepseek-r1:free`)
- **Pay-as-you-go**: Płacisz tylko za użycie
- **Kredyty**: Możesz dodać $5-10 na start

> **Tip**: Aplikacja domyślnie używa **darmowego modelu** `meta-llama/llama-3.2-3b-instruct:free` - nie musisz dodawać kredytów!

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
2. Aplikacja już używa darmowego modelu - jeśli nadal występuje problem, spróbuj innego darmowego modelu
3. Dostępne darmowe modele (edytuj `src/lib/generation.service.ts` linijka 15):
   ```typescript
   MODEL: "meta-llama/llama-3.2-3b-instruct:free", // Domyślny (szybki i skuteczny)
   MODEL: "deepseek/deepseek-r1:free", // Najnowszy, bardzo mocny
   MODEL: "google/gemini-flash-1.5-8b:free", // Darmowy od Google
   ```

### Problem 5: "Insufficient credits"

**Objawy**: Błąd o braku środków

**Rozwiązanie**:
1. **Aplikacja już używa darmowego modelu** - ten błąd nie powinien wystąpić
2. Jeśli jednak wystąpi, sprawdź czy model w `generation.service.ts` kończy się na `:free`
3. Możesz też dodać kredyty na https://openrouter.ai/credits (opcjonalne)

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

### 🆓 Modele darmowe (RECOMMENDED):
```typescript
MODEL: "meta-llama/llama-3.2-3b-instruct:free"  // ✅ DOMYŚLNY - szybki i skuteczny
MODEL: "deepseek/deepseek-r1:free"              // Najnowszy, bardzo mocny
MODEL: "google/gemini-flash-1.5-8b:free"        // Darmowy od Google
MODEL: "mistralai/mistral-7b-instruct:free"     // Solidny wybór
```

### 💰 Modele płatne (dla lepszych wyników):
```typescript
MODEL: "openai/gpt-3.5-turbo"       // ~$0.0005/request
MODEL: "openai/gpt-4-turbo"         // ~$0.01/request
MODEL: "anthropic/claude-3-haiku"   // ~$0.00025/request
```

### Zmiana modelu:

Edytuj `src/lib/generation.service.ts`:
```typescript
const GENERATION_CONFIG = {
  MODEL: "meta-llama/llama-3.2-3b-instruct:free", // ← Zmień tutaj
  TIMEOUT_MS: 60000,
  USE_MOCK: import.meta.env.DEV && !import.meta.env.OPENROUTER_API_KEY,
} as const;
```

Zrestartuj dev server.

## 💡 Wskazówki

1. **Darmowy model**: Aplikacja używa `meta-llama/llama-3.2-3b-instruct:free` - nie potrzebujesz kredytów! 🎉
2. **Monitoruj użycie** na https://openrouter.ai/activity (dla statystyk)
3. **Testuj różne modele** - wszystkie oznaczone `:free` są darmowe
4. **Zawsze restartuj server** po zmianie `.env` lub modelu
5. **Sprawdzaj logi** w terminalu przy każdym generowaniu

## 📞 Dalsze wsparcie

Jeśli nadal nie działa:

1. **Sprawdź logi** z sekcji Debug Checklist
2. **Zrób screenshot** błędu z terminala
3. **Sprawdź** czy `.env` nie jest w `.gitignore` (powinien być!)
4. **Sprawdź** dokumentację OpenRouter: https://openrouter.ai/docs

---

**Status po konfiguracji**: ✅ OpenRouter API powinno działać!

