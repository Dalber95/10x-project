# Szybki Start - 10xCards

## ✅ Problem rozwiązany!

**Błąd "OpenRouterError"** został naprawiony! Aplikacja teraz:
- ✅ Działa **bez klucza API OpenRouter** w trybie deweloperskim
- ✅ Generuje **mockowe fiszki** do testowania
- ✅ Autentykacja działa poprawnie
- ✅ Wszystko gotowe do użycia!

## 🚀 Co zrobiłem?

### 1. Dodałem tryb mockowy (bez API key)
W pliku `src/lib/generation.service.ts` dodałem funkcję `generateMockFlashcards()`, która:
- Automatycznie aktywuje się gdy brak `OPENROUTER_API_KEY` w `.env`
- Generuje 3-10 przykładowych fiszek na podstawie długości tekstu
- Pokazuje komunikat w konsoli: 🎭 "Using mock flashcards (no OpenRouter API key found)"

### 2. Utworzyłem plik `.env.example`
Template z wymaganymi zmiennymi:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key-here
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here  # OPCJONALNY w dev
```

### 3. Zaktualizowałem README.md
Dodałem informację że:
- `OPENROUTER_API_KEY` jest **opcjonalny** w development
- Aplikacja używa mocków jeśli brak API key

## 📋 Jak teraz uruchomić aplikację?

### Opcja 1: Bez klucza OpenRouter (tryb mock)

1. **Utwórz plik `.env`**:
   ```bash
   cp .env.example .env
   ```

2. **Wypełnij tylko Supabase** (OpenRouter zostaw puste lub usuń):
   ```env
   SUPABASE_URL=https://twoj-projekt.supabase.co
   SUPABASE_KEY=twoj-klucz-anon
   # OPENROUTER_API_KEY= # Zakomentowane lub puste
   ```

3. **Uruchom aplikację**:
   ```bash
   npm run dev
   ```

4. **Testuj**:
   - Wejdź na http://localhost:4321
   - Zarejestruj nowe konto
   - Wklej tekst (min. 100 znaków)
   - Kliknij "Generuj fiszki"
   - **Zobaczysz mockowe fiszki!** 🎉

### Opcja 2: Z prawdziwym AI (OpenRouter)

1. **Zdobądź klucz API**:
   - Wejdź na https://openrouter.ai/keys
   - Zaloguj się / Zarejestruj
   - Utwórz nowy API key

2. **Dodaj do `.env`**:
   ```env
   SUPABASE_URL=https://twoj-projekt.supabase.co
   SUPABASE_KEY=twoj-klucz-anon
   OPENROUTER_API_KEY=sk-or-v1-twoj-klucz-tutaj
   ```

3. **Uruchom i testuj** - teraz fiszki będą generowane przez prawdziwe AI!

## 🧪 Jak sprawdzić czy działa?

### 1. Testuj autentykację
```
http://localhost:4321/register
→ Utwórz konto
→ Automatyczne przekierowanie do /generate
→ Widzisz przycisk "Wyloguj się" ✓
```

### 2. Debug endpoint
```
http://localhost:4321/api/auth/debug
→ Powinno zwrócić JSON z user.id i email ✓
```

### 3. Generuj fiszki
```
1. Wklej tekst (np. 200 znaków)
2. Kliknij "Generuj fiszki"
3. W konsoli serwera zobacz: 🎭 Using mock flashcards...
4. Zobaczysz 3-10 przykładowych fiszek ✓
```

## 📝 Przykładowy mockowe fiszki

Po wklejeniu tekstu zobaczysz coś takiego:

```
┌─────────────────────────────────────────┐
│ ✅ Pytanie 1 na podstawie tekstu        │
│                                         │
│ Odpowiedź 1 wygenerowana z fragmentu    │
│ tekstu. To jest przykładowa fiszka      │
│ utworzona w trybie deweloperskim bez    │
│ użycia API OpenRouter.                  │
└─────────────────────────────────────────┘
```

## 🎯 Co dalej?

### Wszystko działa lokalnie!
Możesz teraz:
- ✅ Testować autentykację (rejestracja, logowanie, wylogowanie)
- ✅ Generować mockowe fiszki
- ✅ Zapisywać fiszki do bazy
- ✅ Edytować i usuwać fiszki
- ✅ Rozwijać nowe funkcje

### Aby użyć prawdziwego AI:
1. Zdobądź klucz OpenRouter API (darmowy trial dostępny)
2. Dodaj do `.env`
3. Restart dev server
4. Gotowe! 🚀

## 🐛 Rozwiązywanie problemów

### Problem: Dalej widzę "OpenRouterError"
**Rozwiązanie**: Zrestartuj dev server (Ctrl+C, potem `npm run dev`)

### Problem: Nie widzę mocków
**Sprawdź**:
1. Czy w konsoli serwera jest 🎭 "Using mock flashcards..."?
2. Czy `.env` nie ma `OPENROUTER_API_KEY` lub jest pusty?
3. Czy dev server został zrestartowany po zmianach?

### Problem: "Unauthorized" przy generowaniu
**Sprawdź**:
1. Czy jesteś zalogowany?
2. Czy cookies są ustawione? (DevTools → Application → Cookies)
3. Użyj debug endpoint: http://localhost:4321/api/auth/debug

## 📚 Pełna dokumentacja

- **Autentykacja**: `.ai/auth-integration-summary.md`
- **Troubleshooting**: `.ai/auth-troubleshooting.md`
- **Komponenty UI**: `.ai/auth-ui-implementation.md`
- **Przepływ użytkownika**: `.ai/diagrams/auth-ui-flow.md`

---

**Status**: ✅ Wszystko gotowe do użycia!

Miłego kodowania! 🎉

