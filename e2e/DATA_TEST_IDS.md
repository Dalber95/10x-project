# Data Test IDs - Mapa Atrybutów dla Testów E2E

Ten dokument zawiera listę wszystkich atrybutów `data-test-id` dodanych do komponentów aplikacji w celu ułatwienia pisania testów e2e.

## Scenariusz: Logowanie i generowanie fiszek

### 1. Strona logowania (`/login`)

#### LoginForm.tsx
- `login-email-input` - Input email
- `login-password-input` - Input hasło
- `login-submit-button` - Przycisk "Zaloguj się"

### 2. Strona generowania fiszek (`/generate`)

#### TextInputArea.tsx
- `source-text-input` - Pole textarea do wpisania tekstu źródłowego (minimum 100 znaków)

#### GenerateButton.tsx
- `generate-flashcards-button` - Przycisk "Generuj fiszki"

#### FlashcardList.tsx
- `flashcard-list` - Kontener z listą wygenerowanych fiszek

#### FlashcardListItem.tsx
Każda fiszka ma następujące atrybuty (gdzie `{index}` to indeks fiszki zaczynający się od 0):

- `flashcard-item-{index}` - Karta całej fiszki
- `flashcard-accept-button-{index}` - Przycisk "Zaakceptuj" / "Zaakceptowana"
- `flashcard-edit-button-{index}` - Przycisk "Edytuj"
- `flashcard-reject-button-{index}` - Przycisk "Odrzuć"

#### BulkSaveButton.tsx
- `save-all-flashcards-button` - Przycisk "Zapisz wszystkie (X)"
- `save-accepted-flashcards-button` - Przycisk "Zapisz zaakceptowane (X)"

## Przykładowe użycie w testach Playwright

### Logowanie
```typescript
await page.getByTestId('login-email-input').fill('user@example.com');
await page.getByTestId('login-password-input').fill('password123');
await page.getByTestId('login-submit-button').click();
```

### Wpisanie tekstu źródłowego
```typescript
const sourceText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...'; // minimum 100 znaków
await page.getByTestId('source-text-input').fill(sourceText);
```

### Generowanie fiszek
```typescript
await page.getByTestId('generate-flashcards-button').click();
```

### Oczekiwanie na wygenerowanie fiszek
```typescript
await page.getByTestId('flashcard-list').waitFor({ state: 'visible' });
```

### Akceptowanie konkretnej fiszki
```typescript
// Zaakceptuj pierwszą fiszkę (index 0)
await page.getByTestId('flashcard-accept-button-0').click();
```

### Zapisywanie wszystkich fiszek
```typescript
await page.getByTestId('save-all-flashcards-button').click();
```

### Zapisywanie tylko zaakceptowanych fiszek
```typescript
await page.getByTestId('save-accepted-flashcards-button').click();
```

## Pełny przykładowy scenariusz testowy

### Wariant 1: Bezpośrednie użycie data-test-id

```typescript
import { test, expect } from '@playwright/test';

test('Logowanie i generowanie fiszek - pełny scenariusz', async ({ page }) => {
  // 1. Przejdź do strony logowania
  await page.goto('/login');
  
  // 2. Zaloguj się
  await page.getByTestId('login-email-input').fill('user@example.com');
  await page.getByTestId('login-password-input').fill('SecurePassword123');
  await page.getByTestId('login-submit-button').click();
  
  // 3. Poczekaj na przekierowanie do /generate
  await page.waitForURL('/generate');
  
  // 4. Wpisz tekst źródłowy (minimum 100 znaków)
  const sourceText = `
    Sztuczna inteligencja (AI) to dziedzina informatyki zajmująca się tworzeniem systemów 
    zdolnych do wykonywania zadań wymagających ludzkiej inteligencji. Obejmuje uczenie maszynowe, 
    przetwarzanie języka naturalnego oraz rozpoznawanie obrazów.
  `.trim();
  
  await page.getByTestId('source-text-input').fill(sourceText);
  
  // 5. Wygeneruj fiszki
  await page.getByTestId('generate-flashcards-button').click();
  
  // 6. Poczekaj na wygenerowanie fiszek
  await page.getByTestId('flashcard-list').waitFor({ state: 'visible' });
  
  // 7. Opcjonalnie: zaakceptuj wybrane fiszki
  // Zaakceptuj pierwszą i drugą fiszkę
  await page.getByTestId('flashcard-accept-button-0').click();
  await page.getByTestId('flashcard-accept-button-1').click();
  
  // 8. Zapisz wszystkie fiszki
  await page.getByTestId('save-all-flashcards-button').click();
  
  // 9. Weryfikacja
  // Sprawdź czy pojawił się toast sukcesu lub została wyczyszczona lista
  await expect(page.getByTestId('flashcard-list')).not.toBeVisible();
});
```

### Wariant 2: Użycie Page Object Model (ZALECANE)

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { GeneratePage } from './pages/GeneratePage';
import { TestConfig } from './helpers/test-config';

test('Logowanie i generowanie fiszek - pełny scenariusz z POM', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const generatePage = new GeneratePage(page);
  
  // 1. Zaloguj się (używając zmiennych z .env.test)
  await loginPage.goto();
  await loginPage.login(TestConfig.user.email, TestConfig.user.password);
  await loginPage.waitForSuccessfulLogin();
  
  // 2. Wpisz tekst i wygeneruj fiszki
  const sourceText = `
    Sztuczna inteligencja (AI) to dziedzina informatyki zajmująca się tworzeniem systemów 
    zdolnych do wykonywania zadań wymagających ludzkiej inteligencji. Obejmuje uczenie maszynowe, 
    przetwarzanie języka naturalnego oraz rozpoznawanie obrazów.
  `.trim();
  
  await generatePage.generateFlashcardsFromText(sourceText);
  
  // 3. Zaakceptuj wybrane fiszki
  await generatePage.acceptFlashcardsByIndices([0, 1]);
  
  // 4. Zapisz wszystkie fiszki
  await generatePage.clickSaveAll();
  
  // 5. Weryfikacja
  await generatePage.waitForToast('Sukces');
  await generatePage.waitForSuccessfulSave();
});
```

## Zmienne środowiskowe (.env.test)

Projekt używa dedykowanego pliku `.env.test` dla konfiguracji testów.

### Utworzenie pliku .env.test

Utwórz plik `.env.test` w głównym katalogu projektu:

```bash
# Test User Credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!

# Supabase Test Configuration
PUBLIC_SUPABASE_URL=your_test_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_test_supabase_anon_key

# Application URLs
BASE_URL=http://localhost:4321
```

### Użycie TestConfig Helper

Zamiast hardcodować dane testowe, używaj `TestConfig`:

```typescript
import { TestConfig } from './helpers/test-config';

// ✅ DOBRZE
await loginPage.login(TestConfig.user.email, TestConfig.user.password);

// ❌ ŹLE
await loginPage.login('test@example.com', 'password');
```

## Page Object Model (POM)

Dla łatwiejszego i bardziej maintainable testowania, utworzono klasy POM:

### LoginPage
Lokalizacja: `e2e/pages/LoginPage.ts`

**Metody:**
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
Lokalizacja: `e2e/pages/GeneratePage.ts`

**Metody:**
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
Lokalizacja: `e2e/pages/components/FlashcardItem.ts`

**Metody:**
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

### TestConfig Helper
Lokalizacja: `e2e/helpers/test-config.ts`

Centralny helper do zarządzania zmiennymi środowiskowymi testowymi.

**Dostępne konfiguracje:**
- `TestConfig.user.email` - email użytkownika testowego
- `TestConfig.user.password` - hasło użytkownika testowego
- `TestConfig.urls.base` - bazowy URL aplikacji
- `TestConfig.urls.login` - ścieżka do logowania
- `TestConfig.urls.generate` - ścieżka do generowania
- `TestConfig.supabase.url` - URL Supabase
- `TestConfig.supabase.anonKey` - klucz Supabase
- `TestConfig.timeouts.default` - domyślny timeout (30s)
- `TestConfig.timeouts.generation` - timeout dla generowania (60s)

## Uwagi

- Indeksy fiszek (`{index}`) zaczynają się od `0`
- Przyciski "Zapisz zaakceptowane" są aktywne tylko gdy przynajmniej jedna fiszka została zaakceptowana
- Przycisk "Generuj fiszki" jest aktywny tylko gdy tekst ma co najmniej 100 znaków i nie przekracza 10000 znaków
- Po pomyślnym zapisaniu fiszek, lista zostaje wyczyszczona
- **Zaleca się używanie klas POM** zamiast bezpośredniego dostępu do elementów przez `data-test-id`

## Ważne: Selektory w Page Object Model

### Preferencja: Accessible Selectors > data-test-id

Klasy POM używają **accessible selectors** (getByRole, getByLabel) zamiast data-test-id, ponieważ:
1. Są bardziej odporne na zmiany w implementacji
2. Lepiej współpracują z Astro + React hydratacją
3. Testują accessibility aplikacji
4. Playwright używa `aria-label` jako "accessible name" dla elementów

### Przykład z GenerateButton

Komponent:
```tsx
<Button aria-label="Rozpocznij generowanie fiszek">
  Generuj fiszki
</Button>
```

Selektor w POM:
```typescript
// ✅ POPRAWNIE - używa aria-label
this.generateButton = page.getByRole('button', { name: /rozpocznij generowanie fiszek/i });

// ❌ ŹLE - szuka tekstu wewnętrznego, nie aria-label
this.generateButton = page.getByRole('button', { name: /generuj fiszki/i });
```

### Przyciski z dynamicznym aria-label

Niektóre przyciski mają dynamiczne aria-label (np. z liczbą fiszek):
- "Zapisz wszystkie 5 fiszek do bazy danych"
- "Zapisz 3 zaakceptowanych fiszek do bazy danych"

Selektory używają regex z wildcardami:
```typescript
this.saveAllButton = page.getByRole('button', { name: /zapisz wszystkie.*fiszek do bazy danych/i });
this.saveAcceptedButton = page.getByRole('button', { name: /zapisz.*zaakceptowanych fiszek do bazy danych/i });
```

