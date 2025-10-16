# E2E Tests - Playwright

Ten katalog zawiera testy end-to-end napisane w Playwright zgodnie z najlepszymi praktykami.

## Struktura katalogów

```
e2e/
├── pages/                          # Page Object Model classes
│   ├── LoginPage.ts               # Strona logowania
│   ├── GeneratePage.ts            # Strona generowania fiszek
│   └── components/                # Komponenty wielokrotnego użytku
│       └── FlashcardItem.ts       # Pojedyncza fiszka
├── helpers/                        # Helper utilities
│   ├── test-config.ts             # Konfiguracja zmiennych środowiskowych
│   └── test-teardown.ts           # Narzędzia czyszczenia danych testowych
├── flashcard-generation-flow.spec.ts  # Główny test flow
├── auth.spec.ts                   # Testy autentykacji
├── example.spec.ts                # Przykładowe testy
├── config-validation.spec.ts      # Walidacja konfiguracji
├── cleanup-test-data.ts           # Skrypt czyszczenia danych
├── check-env.js                   # Walidacja zmiennych środowiskowych
├── DATA_TEST_IDS.md              # Dokumentacja atrybutów data-test-id
└── README.md                      # Ten plik
```

## Uruchamianie testów

```bash
# Uruchom wszystkie testy
npm run test:e2e

# Uruchom testy w trybie UI
npm run test:e2e:ui

# Uruchom testy w trybie debug
npm run test:e2e:debug

# Uruchom konkretny plik testowy
npx playwright test flashcard-generation-flow.spec.ts

# Uruchom testy w trybie headed (z widoczną przeglądarką)
npx playwright test --headed

# Uruchom testy z raportem HTML
npx playwright test --reporter=html

# Wygeneruj kod testowy (codegen)
npm run test:e2e:codegen

# Wyczyść dane testowe (po zakończeniu testów)
npm run test:e2e:cleanup

# Wyczyść tylko dane z ostatnich 30 minut
npm run test:e2e:cleanup:recent
```

## Page Object Model (POM)

Wszystkie testy używają wzorca Page Object Model dla lepszej utrzymywalności i czytelności.

### LoginPage

Reprezentuje stronę logowania (`/login`).

**Przykład użycia:**
```typescript
import { LoginPage } from './pages/LoginPage';

const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login('user@example.com', 'password123');
await loginPage.waitForSuccessfulLogin();
```

**Dostępne metody:**
- `goto()` - przejdź do strony logowania
- `fillEmail(email)` - wypełnij pole email
- `fillPassword(password)` - wypełnij pole hasła
- `clickSubmit()` - kliknij przycisk zaloguj
- `login(email, password)` - wykonaj pełny flow logowania
- `isSubmitEnabled()` - sprawdź czy przycisk jest aktywny
- `hasError()` - sprawdź czy wyświetlany jest błąd
- `getErrorMessage()` - pobierz treść błędu
- `waitForSuccessfulLogin()` - poczekaj na przekierowanie po zalogowaniu

### GeneratePage

Reprezentuje stronę generowania fiszek (`/generate`).

**Przykład użycia:**
```typescript
import { GeneratePage } from './pages/GeneratePage';

const generatePage = new GeneratePage(page);
await generatePage.goto();
await generatePage.generateFlashcardsFromText('Długi tekst...');
await generatePage.acceptFlashcardsByIndices([0, 1, 2]);
await generatePage.clickSaveAccepted();
```

**Dostępne metody:**
- `goto()` - przejdź do strony generowania
- `fillSourceText(text)` - wypełnij pole tekstem źródłowym
- `clickGenerate()` - kliknij przycisk generuj
- `waitForFlashcards()` - poczekaj na wyświetlenie fiszek
- `waitForGenerationComplete()` - poczekaj na zakończenie generowania
- `getFlashcard(index)` - pobierz obiekt fiszki o danym indeksie
- `getAllFlashcards()` - pobierz wszystkie fiszki
- `getFlashcardCount()` - pobierz liczbę fiszek
- `clickSaveAll()` - zapisz wszystkie fiszki
- `clickSaveAccepted()` - zapisz zaakceptowane fiszki
- `generateFlashcardsFromText(text)` - kompletny flow generowania
- `acceptAllFlashcards()` - zaakceptuj wszystkie fiszki
- `acceptFlashcardsByIndices(indices)` - zaakceptuj wybrane fiszki
- `waitForToast(text?)` - poczekaj na powiadomienie toast
- `waitForSuccessfulSave()` - poczekaj na pomyślne zapisanie

### FlashcardItem

Reprezentuje pojedynczą fiszkę na liście.

**Przykład użycia:**
```typescript
const flashcard = generatePage.getFlashcard(0);
await flashcard.accept();
await flashcard.edit('Nowy przód', 'Nowy tył');
expect(await flashcard.isAccepted()).toBe(true);
```

**Dostępne metody:**
- `accept()` - zaakceptuj fiszkę
- `reject()` - odrzuć fiszkę
- `startEdit()` - rozpocznij edycję
- `edit(front, back)` - edytuj fiszkę
- `saveEdit()` - zapisz edycję
- `cancelEdit()` - anuluj edycję
- `getFrontText()` - pobierz tekst przodu fiszki
- `getBackText()` - pobierz tekst tyłu fiszki
- `isAccepted()` - sprawdź czy fiszka jest zaakceptowana
- `isEdited()` - sprawdź czy fiszka była edytowana
- `isInEditMode()` - sprawdź czy fiszka jest w trybie edycji
- `waitForVisible()` - poczekaj na wyświetlenie fiszki

## Pisanie nowych testów

### 1. Używaj Page Object Model

✅ **DOBRZE:**
```typescript
test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await loginPage.waitForSuccessfulLogin();
});
```

❌ **ŹLE:**
```typescript
test('should login successfully', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill('user@example.com');
  await page.getByTestId('login-password-input').fill('password');
  await page.getByTestId('login-submit-button').click();
});
```

### 2. Używaj data-test-id dla stabilnych selektorów

Wszystkie kluczowe elementy mają atrybuty `data-test-id`. Zobacz `DATA_TEST_IDS.md` dla pełnej listy.

### 3. Grupuj testy w describe blocks

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup przed każdym testem
  });

  test('should do something', async ({ page }) => {
    // Test
  });
});
```

### 4. Używaj hooks dla setup i teardown

```typescript
test.beforeEach(async ({ page }) => {
  // Wykonuje się przed każdym testem
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
});

test.afterEach(async ({ page }) => {
  // Cleanup po każdym teście
});
```

### 5. Używaj expect z konkretnymi matcherami

```typescript
// ✅ DOBRZE
expect(await page.title()).toBe('Generuj fiszki');
expect(await generatePage.getFlashcardCount()).toBeGreaterThan(0);
await expect(page.getByTestId('flashcard-list')).toBeVisible();

// ❌ ŹLE
expect(await page.title()).not.toBe('');
```

## Najlepsze praktyki

### 1. Izolacja testów
- Każdy test powinien być niezależny
- Używaj `test.beforeEach` dla setup
- Nie polegaj na kolejności wykonania testów

### 2. Oczekiwanie na elementy
```typescript
// ✅ Używaj built-in auto-waiting
await page.getByTestId('button').click();

// ❌ Unikaj ręcznych timeoutów
await page.waitForTimeout(1000);
```

### 3. Selektory (w kolejności preferowania)

**W Page Object Model używamy accessible selectors zamiast data-test-id dla lepszej integracji z Astro + React:**

1. **Accessible selectors** - `getByRole`, `getByLabel`, `getByText`
   - Testują accessibility aplikacji
   - Bardziej odporne na zmiany implementacji
   - Lepiej współpracują z hydratacją React
2. **data-test-id** - dla elementów gdzie accessible selectors nie są praktyczne
3. **CSS selectors** - tylko w ostateczności

**⚠️ Ważne uwagi o selektorach:**

#### Playwright używa aria-label jako "accessible name"
```typescript
// Komponent
<Button aria-label="Rozpocznij generowanie fiszek">
  Generuj fiszki
</Button>

// ✅ POPRAWNIE - używa aria-label
page.getByRole('button', { name: /rozpocznij generowanie fiszek/i })

// ❌ ŹLE - szuka tekstu wewnętrznego, nie aria-label
page.getByRole('button', { name: /generuj fiszki/i })
```

#### Password fields nie mają roli "textbox"
```typescript
// ✅ POPRAWNIE - używa getByLabel
page.getByLabel(/hasło/i)

// ❌ ŹLE - password nie ma role="textbox"
page.getByRole('textbox', { name: /hasło/i })
```

#### Dynamiczne aria-labels wymagają regex z wildcardami
```typescript
// Komponent może mieć: "Zapisz wszystkie 5 fiszek do bazy danych"
page.getByRole('button', { name: /zapisz wszystkie.*fiszek do bazy danych/i })
```

**Debugging selektorów:**
- Sprawdź `test-results/[test-name]/error-context.md` dla struktury DOM
- Użyj `npx playwright show-report` dla screenshotów
- Zobacz `TROUBLESHOOTING.md` dla typowych problemów

### 4. Asercje
```typescript
// ✅ Web-first assertions (auto-retry)
await expect(page.getByTestId('element')).toBeVisible();

// ❌ Unikaj manual assertions bez retry
expect(await element.isVisible()).toBe(true);
```

### 5. Debugowanie
```typescript
// Dodaj breakpoint w trybie debug
await page.pause();

// Zrzut ekranu
await page.screenshot({ path: 'screenshot.png' });

// Trace viewer (zapisuje się automatycznie przy błędzie)
npx playwright show-trace trace.zip
```

## Przykładowe scenariusze testowe

### Pełny flow: Logowanie → Generowanie → Zapisywanie

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { GeneratePage } from './pages/GeneratePage';

test('complete flashcard generation flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const generatePage = new GeneratePage(page);
  
  // Login
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await loginPage.waitForSuccessfulLogin();
  
  // Generate (tekst musi mieć minimum 100 znaków)
  const text = `
    Sztuczna inteligencja to dziedzina informatyki zajmująca się 
    tworzeniem systemów zdolnych do wykonywania zadań wymagających 
    ludzkiej inteligencji.
  `.trim();
  
  await generatePage.generateFlashcardsFromText(text);
  
  // Accept and save
  await generatePage.acceptAllFlashcards();
  await generatePage.clickSaveAccepted();
  await generatePage.waitForToast('Sukces');
});
```

### Test edycji fiszki

```typescript
test('should edit flashcard', async ({ page }) => {
  const generatePage = new GeneratePage(page);
  // ... setup i generowanie ...
  
  const flashcard = generatePage.getFlashcard(0);
  await flashcard.edit('New front', 'New back');
  
  expect(await flashcard.isEdited()).toBe(true);
});
```

### Test akceptowania wybranych fiszek

```typescript
test('should accept specific flashcards', async ({ page }) => {
  const generatePage = new GeneratePage(page);
  // ... setup i generowanie ...
  
  // Zaakceptuj fiszki 0, 2, 4
  await generatePage.acceptFlashcardsByIndices([0, 2, 4]);
  
  // Zapisz tylko zaakceptowane
  await generatePage.clickSaveAccepted();
  await generatePage.waitForToast('Sukces');
});
```

## Konfiguracja

Konfiguracja Playwright znajduje się w `playwright.config.ts` w głównym katalogu projektu.

### Ważne ustawienia:
- **Browser**: Chromium (Desktop Chrome)
- **Retries**: 2 próby dla failed testów w CI
- **Timeout**: 30s domyślnie
- **Trace**: Zapisywane tylko przy błędach
- **Screenshots**: Tylko przy błędach

### Zmienne środowiskowe (.env.test)

Testy używają dedykowanego pliku `.env.test` dla izolacji środowiska testowego.

**Utworzenie pliku `.env.test` w głównym katalogu projektu:**

```bash
# Environment variables for E2E testing

# Test User Credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!

# Supabase Test Configuration
PUBLIC_SUPABASE_URL=your_test_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_test_supabase_anon_key

# OpenRouter Test API Key (optional)
OPENROUTER_API_KEY=your_test_openrouter_api_key

# Application URLs
BASE_URL=http://localhost:4321
```

**Użycie w testach:**

```typescript
test('should login with test credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // Użyj zmiennych środowiskowych
  const email = process.env.TEST_USER_EMAIL || 'default@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'defaultPassword';
  
  await loginPage.login(email, password);
  await loginPage.waitForSuccessfulLogin();
});
```

**Zalety używania `.env.test`:**
- ✅ Izolacja danych testowych od produkcji
- ✅ Bezpieczne przechowywanie credentials (plik w `.gitignore`)
- ✅ Łatwa zmiana konfiguracji bez edycji kodu
- ✅ Możliwość używania testowej bazy danych

## Czyszczenie danych testowych (Teardown)

### Automatyczne czyszczenie

Testy automatycznie czyszczą dane po każdym teście dzięki `afterEach` hook:

```typescript
test.afterEach(async () => {
  if (TestConfig.user.id) {
    await cleanupTestUser(TestConfig.user.id);
  }
});
```

### Manualne czyszczenie

Jeśli potrzebujesz ręcznie wyczyścić dane testowe:

```bash
# Wyczyść WSZYSTKIE dane testowe użytkownika
npm run test:e2e:cleanup

# Wyczyść tylko dane z ostatnich 30 minut
npm run test:e2e:cleanup:recent

# Wyczyść dane z ostatniej godziny
npx tsx e2e/cleanup-test-data.ts recent 60
```

### Funkcje pomocnicze

W `e2e/helpers/test-teardown.ts` dostępne są:

```typescript
import { 
  cleanupTestUser,           // Usuń wszystkie dane użytkownika
  cleanupRecentTestData,     // Usuń dane z ostatnich N minut
  deleteUserFlashcards,      // Usuń tylko fiszki
  deleteUserGenerations,     // Usuń tylko generacje
  getTestDataCount           // Sprawdź ile danych jest w bazie
} from './helpers/test-teardown';

// Przykład użycia w teście
test.afterEach(async () => {
  await cleanupTestUser(TestConfig.user.id);
});
```

### Co jest czyszczone?

Teardown usuwa w odpowiedniej kolejności:
1. **Flashcards** - wszystkie fiszki użytkownika testowego
2. **Generation Error Logs** - logi błędów generowania
3. **Generations** - metadata generacji AI

**Uwaga:** Kolejność jest ważna ze względu na foreign keys w bazie danych.

### Dlaczego to ważne?

- ✅ **Idempotentność** - testy można uruchamiać wielokrotnie z tym samym wynikiem
- ✅ **Czystość środowiska** - każdy test zaczyna ze świeżym stanem
- ✅ **Brak konfliktów** - równoległe testy nie kolidują ze sobą
- ✅ **Oszczędność miejsca** - baza testowa nie zapełnia się danymi

## CI/CD

Testy automatycznie uruchamiają się w pipeline CI. Zobacz `.github/workflows` dla konfiguracji.

## Rozwiązywanie problemów

Jeśli masz problemy z testami, sprawdź **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** dla:
- Typowych błędów i ich rozwiązań
- Narzędzi debugowania
- Best practices dla selektorów
- Problemów z hydratacją React w Astro

## Dodatkowe zasoby

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [DATA_TEST_IDS.md](./DATA_TEST_IDS.md) - Lista wszystkich data-test-id w projekcie
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Rozwiązywanie problemów z testami
- [TEARDOWN.md](./TEARDOWN.md) - Czyszczenie danych testowych
