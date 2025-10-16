# Test Teardown - Czyszczenie Danych Testowych

## 🎯 Cel

Zapewnić, że testy E2E są **idempotentne** - można je uruchamiać wielokrotnie bez zaśmiecania bazy danych.

## ⚡ Szybki Start

### Automatyczne czyszczenie (w testach)

```typescript
import { cleanupTestUser } from './helpers/test-teardown';
import { TestConfig } from './helpers/test-config';

test.afterEach(async () => {
  // Czyszczenie po każdym teście
  if (TestConfig.user.id) {
    await cleanupTestUser(TestConfig.user.id);
  }
});
```

### Manualne czyszczenie

```bash
# Wyczyść wszystkie dane testowe
npm run test:e2e:cleanup

# Wyczyść tylko dane z ostatnich 30 minut
npm run test:e2e:cleanup:recent

# Wyczyść dane z ostatniej godziny
npx tsx e2e/cleanup-test-data.ts recent 60
```

## 📚 Dostępne Funkcje

### `cleanupTestUser(userId: string)`
Usuwa **WSZYSTKIE** dane testowe użytkownika:
- Flashcards (fiszki)
- Generation error logs
- Generations (metadata generacji)

```typescript
await cleanupTestUser('7c03ef2f-2d08-4679-8ca4-3d1cc34c1773');
```

### `cleanupRecentTestData(userId: string, minutesAgo: number)`
Usuwa tylko dane utworzone w ostatnich N minutach:

```typescript
// Usuń dane z ostatnich 15 minut
await cleanupRecentTestData(userId, 15);
```

### `deleteUserFlashcards(userId: string)`
Usuwa tylko fiszki użytkownika:

```typescript
const deletedCount = await deleteUserFlashcards(userId);
console.log(`Usunięto ${deletedCount} fiszek`);
```

### `deleteUserGenerations(userId: string)`
Usuwa tylko generacje (metadata):

```typescript
const deletedCount = await deleteUserGenerations(userId);
```

### `deleteUserGenerationErrors(userId: string)`
Usuwa logi błędów generowania:

```typescript
const deletedCount = await deleteUserGenerationErrors(userId);
```

### `getTestDataCount(userId: string)`
Sprawdza ile danych testowych jest w bazie:

```typescript
const count = await getTestDataCount(userId);
console.log(`Flashcards: ${count.flashcards}`);
console.log(`Generations: ${count.generations}`);
console.log(`Error logs: ${count.errorLogs}`);
```

## 🔄 Kolejność czyszczenia

**WAŻNE:** Dane muszą być usuwane w odpowiedniej kolejności ze względu na foreign keys:

1. ✅ **Flashcards** (najpierw - referencje do generations)
2. ✅ **Generation Error Logs** (logi błędów)
3. ✅ **Generations** (na końcu - referencowane przez flashcards)

Funkcja `cleanupTestUser()` automatycznie zachowuje prawidłową kolejność.

## 🎭 Przykłady użycia

### W testach Playwright

```typescript
test.describe('My Test Suite', () => {
  // Czyszczenie po każdym teście
  test.afterEach(async () => {
    await cleanupTestUser(TestConfig.user.id);
  });

  test('should create flashcards', async ({ page }) => {
    // Twój test...
  });
});
```

### Czyszczenie przed testami

```typescript
test.describe('My Test Suite', () => {
  // Czyszczenie PRZED wszystkimi testami
  test.beforeAll(async () => {
    await cleanupTestUser(TestConfig.user.id);
  });

  // Czyszczenie PO każdym teście
  test.afterEach(async () => {
    await cleanupTestUser(TestConfig.user.id);
  });
});
```

### Selektywne czyszczenie

```typescript
test.afterEach(async () => {
  // Usuń tylko fiszki, zachowaj generacje
  await deleteUserFlashcards(TestConfig.user.id);
});
```

### Warunkowe czyszczenie

```typescript
test.afterEach(async ({ }, testInfo) => {
  // Czyszczenie tylko gdy test się nie powiódł
  if (testInfo.status !== 'passed') {
    const count = await getTestDataCount(TestConfig.user.id);
    console.log('Test failed, leaving data for debugging:', count);
  } else {
    await cleanupTestUser(TestConfig.user.id);
  }
});
```

## 🛠️ Konfiguracja

### Wymagane zmienne w .env.test

```bash
# ID użytkownika testowego (WYMAGANE dla teardown)
E2E_USERNAME_ID=7c03ef2f-2d08-4679-8ca4-3d1cc34c1773

# Dane logowania
E2E_USERNAME=test@example.com
E2E_PASSWORD=YourPassword123

# Supabase (do czyszczenia danych)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
```

### Sprawdzenie konfiguracji

```bash
# Sprawdź czy wszystko jest poprawnie skonfigurowane
node e2e/check-env.js
```

## ⚠️ Uwagi

1. **User ID jest wymagany** - bez niego teardown nie będzie działać
2. **RLS (Row Level Security)** - Supabase automatycznie filtruje dane według `user_id`
3. **Foreign Keys** - zachowuj kolejność usuwania (flashcards → error logs → generations)
4. **Performance** - czyszczenie dużej ilości danych może trwać kilka sekund
5. **Równoległe testy** - każdy test powinien mieć własny teardown w `afterEach`

## 🚀 Best Practices

### ✅ DO
- Zawsze używaj `afterEach` do czyszczenia po testach
- Sprawdzaj czy `TestConfig.user.id` jest ustawiony przed czyszczeniem
- Używaj `cleanupTestUser()` zamiast ręcznego usuwania tabel
- Loguj ile danych zostało usuniętych (do debugowania)

### ❌ DON'T
- Nie usuwaj danych produkcyjnych (używaj dedykowanego użytkownika testowego)
- Nie pomijaj teardown (baza zapełni się danymi testowymi)
- Nie używaj `test.afterAll()` dla czyszczenia danych (może nie zadziałać przy błędach)
- Nie hardcoduj user ID w testach (używaj `TestConfig.user.id`)

## 📊 Monitoring

### Sprawdź ile danych jest w bazie

```bash
# Wyświetl statystyki
npx tsx -e "
import { getTestDataCount } from './e2e/helpers/test-teardown.js';
import { TestConfig } from './e2e/helpers/test-config.js';
const count = await getTestDataCount(TestConfig.user.id);
console.log(count);
"
```

### CI/CD Integration

W pipeline CI dodaj cleanup po testach:

```yaml
- name: Run E2E tests
  run: npm run test:e2e

- name: Cleanup test data
  if: always()
  run: npm run test:e2e:cleanup
```

## 🐛 Troubleshooting

### Błąd: "Supabase configuration is missing"
- Upewnij się, że `SUPABASE_URL` i `SUPABASE_KEY` są w `.env.test`

### Błąd: "TEST_USER_ID not set"
- Dodaj `E2E_USERNAME_ID` do `.env.test`

### Dane nie są usuwane
- Sprawdź RLS policies w Supabase
- Upewnij się, że używasz prawidłowego user_id
- Sprawdź czy test wykonuje `afterEach` hook

### Timeout podczas czyszczenia
- Zwiększ timeout dla teardown operations
- Rozważ czyszczenie tylko ostatnich danych: `cleanupRecentTestData()`

## 📖 Więcej informacji

- [Playwright Test Hooks](https://playwright.dev/docs/api/class-test#test-after-each)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Test Isolation Best Practices](https://playwright.dev/docs/test-isolation)

