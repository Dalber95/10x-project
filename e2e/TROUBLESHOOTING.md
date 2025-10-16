# Troubleshooting E2E Tests

Ten dokument zawiera rozwiązania typowych problemów z testami E2E w projekcie.

## 🔍 Problem: Playwright nie może znaleźć elementu

### Symptom
```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: /generuj fiszki/i }) resolved to 0 elements
```

### Możliwe przyczyny i rozwiązania

#### 1. Niezgodność aria-label z selektorem

**Problem:** Playwright używa `aria-label` jako "accessible name", nie tekst wewnętrzny przycisku.

**Przykład:**
```tsx
// Komponent
<Button aria-label="Rozpocznij generowanie fiszek">
  Generuj fiszki
</Button>

// ❌ ŹLE - szuka tekstu wewnętrznego
page.getByRole('button', { name: /generuj fiszki/i })

// ✅ DOBRZE - szuka aria-label
page.getByRole('button', { name: /rozpocznij generowanie fiszek/i })
```

**Rozwiązanie:** Sprawdź HTML report lub error-context.md i dopasuj selektor do aria-label.

#### 1b. Password field nie jest rozpoznawane jako textbox

**Problem:** Input z `type="password"` NIE ma roli `textbox` w Playwright.

**Przykład:**
```tsx
// Komponent
<Input id="password" type="password" />

// ❌ ŹLE - password nie ma role="textbox"
page.getByRole('textbox', { name: /hasło/i })

// ✅ DOBRZE - użyj getByLabel
page.getByLabel(/hasło/i)
```

**Rozwiązanie:** Dla pól hasła używaj `getByLabel()` zamiast `getByRole('textbox')`.

#### 2. React nie hydratuje się w porę

**Problem:** Komponent React z `client:load` jeszcze się nie załadował.

**Rozwiązanie:**
```typescript
// Dodaj czekanie na element
await page.waitForSelector('[data-test-id="element"]', { state: 'visible' });

// Lub użyj automatycznego czekania Playwright
await page.getByRole('button', { name: /tekst/i }).waitFor({ state: 'visible' });
```

#### 3. Element jest ukryty lub disabled

**Problem:** Element istnieje ale jest niewidoczny lub nieaktywny.

**Debugowanie:**
```typescript
// Sprawdź czy element istnieje
const count = await page.getByRole('button', { name: /tekst/i }).count();
console.log('Liczba elementów:', count);

// Sprawdź stan elementu
const isVisible = await page.getByRole('button', { name: /tekst/i }).isVisible();
const isEnabled = await page.getByRole('button', { name: /tekst/i }).isEnabled();
console.log('Widoczny:', isVisible, 'Aktywny:', isEnabled);
```

## 🔧 Narzędzia debugowania

### 1. Playwright HTML Report
```bash
npx playwright show-report
```
- Otwiera się na `http://localhost:9323`
- Zawiera screenshoty, trace, i strukturę DOM

### 2. Error Context
Po nieudanym teście sprawdź:
```
test-results/[test-name]/error-context.md
```
Zawiera snapshot struktury strony w momencie błędu.

### 3. Playwright Inspector (Debugger)
```bash
npx playwright test --debug
```
- Krok po kroku wykonywanie testu
- Podgląd na żywo selektorów
- Możliwość eksperymentowania z selektorami

### 4. Headed Mode (z przeglądarką)
```bash
npx playwright test --headed
```
Uruchamia testy z widoczną przeglądarką.

### 5. Pojedynczy test z debugowaniem
```bash
npx playwright test flashcard-generation-flow.spec.ts:39 --debug
```

## 🐛 Typowe problemy

### Problem: "Error: page.goto: net::ERR_CONNECTION_REFUSED"

**Przyczyna:** Serwer deweloperski nie jest uruchomiony.

**Rozwiązanie:**
```bash
# Terminal 1 - uruchom serwer
npm run dev

# Terminal 2 - uruchom testy
npx playwright test
```

### Problem: Testy nie czyszczą danych w Supabase

**Przyczyna:** Brak ID użytkownika w TestConfig lub błąd połączenia.

**Debugowanie:**
```typescript
// W teście dodaj
console.log('User ID:', TestConfig.user.id);

// Lub sprawdź ręcznie
npm run test:e2e:cleanup
```

**Rozwiązanie:** Upewnij się że `.env.test` zawiera `TEST_USER_ID`.

### Problem: "Error: Cannot find module 'dotenv'"

**Przyczyna:** Brak zależności.

**Rozwiązanie:**
```bash
npm install dotenv --save-dev
```

### Problem: Flaky tests (niestabilne testy)

**Przyczyna:** Race conditions, zbyt krótkie timeouty.

**Rozwiązanie:**
```typescript
// Użyj auto-waiting Playwright zamiast fixed timeouts
// ❌ ŹLE
await page.waitForTimeout(2000);

// ✅ DOBRZE
await page.getByRole('button').waitFor({ state: 'visible' });

// Opcjonalnie zwiększ timeout dla wolnych operacji
await page.waitForSelector('[data-test-id="flashcard-list"]', { 
  state: 'visible', 
  timeout: 60000 // 60 sekund dla generowania AI
});
```

## 📊 Analiza struktury strony

### Sprawdzenie jak Playwright widzi stronę

```bash
# Uruchom test z trace
npx playwright test --trace on

# Otwórz trace viewer
npx playwright show-trace trace.zip
```

### Codegen - generowanie selektorów
```bash
npx playwright codegen http://localhost:3000
```
- Interaktywnie klikaj elementy
- Playwright generuje selektory automatycznie
- Kopiuj gotowe selektory do testów

## 🔑 Best Practices

### 1. Preferuj accessible selectors

```typescript
// ✅ NAJLEPSZE - testuje accessibility
page.getByRole('button', { name: /zaloguj/i })
page.getByLabel('Email')
page.getByPlaceholder('Wpisz tekst...')

// ✅ DOBRE - stabilne ale mniej semantyczne
page.getByTestId('login-button')

// ❌ UNIKAJ - niestabilne
page.locator('.btn-primary')
page.locator('button:nth-child(2)')
```

### 2. Używaj Page Object Model

```typescript
// ✅ DOBRZE - maintainable i reusable
const loginPage = new LoginPage(page);
await loginPage.login(email, password);

// ❌ ŹLE - duplikacja kodu
await page.getByTestId('email').fill(email);
await page.getByTestId('password').fill(password);
await page.getByTestId('submit').click();
```

### 3. Używaj TestConfig dla danych testowych

```typescript
// ✅ DOBRZE
await loginPage.login(TestConfig.user.email, TestConfig.user.password);

// ❌ ŹLE - hardcoded values
await loginPage.login('test@example.com', 'password');
```

## 🆘 Gdy wszystko zawodzi

1. **Wyczyść cache i node_modules**
```bash
rm -rf node_modules
npm install
npx playwright install
```

2. **Sprawdź wersje**
```bash
npx playwright --version
node --version
npm --version
```

3. **Uruchom diagnostykę Playwright**
```bash
npx playwright install --with-deps
```

4. **Sprawdź logi przeglądarki**
```typescript
page.on('console', msg => console.log('Browser:', msg.text()));
page.on('pageerror', error => console.log('Page error:', error));
```

## 📚 Przydatne linki

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Playwright Debugging](https://playwright.dev/docs/debug)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)

