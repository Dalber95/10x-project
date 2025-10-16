# E2E Tests - Changelog

## 2025-10-16 - Poprawki selektorów i dokumentacja

### 🐛 Naprawione błędy

#### 1. Problem z selektorem przycisku "Generuj fiszki"
**Problem:** Test nie mógł znaleźć przycisku "Generuj fiszki"
```
Error: locator.click: Error: strict mode violation: 
getByRole('button', { name: /generuj fiszki/i }) resolved to 0 elements
```

**Przyczyna:** 
- Playwright używa `aria-label` jako "accessible name", nie tekstu wewnętrznego przycisku
- Przycisk ma `aria-label="Rozpocznij generowanie fiszek"` ale tekst "Generuj fiszki"
- Selektor szukał tekstu zamiast aria-label

**Rozwiązanie:**
```typescript
// e2e/pages/GeneratePage.ts - PRZED
this.generateButton = page.getByRole('button', { name: /generuj fiszki/i });

// e2e/pages/GeneratePage.ts - PO
this.generateButton = page.getByRole('button', { name: /rozpocznij generowanie fiszek/i });
```

**Zmienione pliki:**
- `e2e/pages/GeneratePage.ts` (linia 25)

---

#### 2. Problem z selektorem pola hasła
**Problem:** Pole hasła nie było rozpoznawane jako textbox

**Przyczyna:** 
- Input z `type="password"` NIE ma roli `textbox` w Playwright
- Tylko `type="text"`, `type="email"`, itp. mają rolę textbox

**Rozwiązanie:**
```typescript
// e2e/pages/LoginPage.ts - PRZED
this.passwordInput = page.getByRole('textbox', { name: /hasło/i });

// e2e/pages/LoginPage.ts - PO
this.passwordInput = page.getByLabel(/hasło/i); // password inputs don't have role="textbox"
```

**Zmienione pliki:**
- `e2e/pages/LoginPage.ts` (linia 21)

---

#### 3. Ulepszone selektory dla przycisków zapisywania
**Problem:** Przyciski "Zapisz wszystkie" i "Zapisz zaakceptowane" mają dynamiczne aria-labels z liczbą fiszek

**Przed:**
```typescript
// Mogło nie znaleźć przycisków z pełnym aria-label:
// "Zapisz wszystkie 5 fiszek do bazy danych"
this.saveAllButton = page.getByRole('button', { name: /zapisz wszystkie/i });
```

**Po (bardziej precyzyjne):**
```typescript
// Pasuje do pełnego aria-label z dowolną liczbą
this.saveAllButton = page.getByRole('button', { name: /zapisz wszystkie.*fiszek do bazy danych/i });
this.saveAcceptedButton = page.getByRole('button', { name: /zapisz.*zaakceptowanych fiszek do bazy danych/i });
```

**Zmienione pliki:**
- `e2e/pages/GeneratePage.ts` (linie 27-28)

---

### 📝 Nowa dokumentacja

#### 1. TROUBLESHOOTING.md
Kompleksowy przewodnik po rozwiązywaniu problemów z testami E2E:
- Problem: Playwright nie może znaleźć elementu (aria-label vs tekst)
- Problem: Password field nie jest rozpoznawane jako textbox
- Problem: React nie hydratuje się w porę
- Problem: Element jest ukryty lub disabled
- Narzędzia debugowania (HTML report, error-context, Inspector, codegen)
- Typowe problemy (serwer nie uruchomiony, brak czyszczenia danych, flaky tests)
- Best practices dla selektorów i POM
- Analiza struktury strony

**Lokalizacja:** `e2e/TROUBLESHOOTING.md`

---

#### 2. Rozszerzona dokumentacja w DATA_TEST_IDS.md
Dodano sekcję "Ważne: Selektory w Page Object Model":
- Wyjaśnienie dlaczego używamy accessible selectors zamiast data-test-id
- Przykłady z GenerateButton (aria-label vs tekst)
- Przykłady z dynamicznymi aria-labels
- Best practices dla Playwright + Astro + React

**Zmienione pliki:**
- `e2e/DATA_TEST_IDS.md` (sekcja dodana na końcu)

---

#### 3. Rozszerzona dokumentacja w README.md
Dodano szczegółową sekcję "Selektory (w kolejności preferowania)":
- Wyjaśnienie używania accessible selectors w POM
- Przykłady problemów z aria-label
- Przykłady z password fields
- Przykłady z dynamicznymi labels
- Linki do debugging tools

Dodano sekcję "Rozwiązywanie problemów":
- Link do TROUBLESHOOTING.md
- Szybki dostęp do narzędzi debugowania

**Zmienione pliki:**
- `e2e/README.md` (sekcje 3 i końcowa)

---

### ✅ Rezultat

Po tych zmianach:
1. ✅ Wszystkie selektory w Page Object Model są poprawne
2. ✅ Testy powinny przechodzić bez problemów z lokalizacją elementów
3. ✅ Dokumentacja wyjaśnia dlaczego i jak używać selektorów
4. ✅ Troubleshooting guide pomaga w debugowaniu przyszłych problemów

---

### 🧪 Testowanie

Aby zweryfikować poprawki:

```bash
# 1. Uruchom serwer deweloperski
npm run dev

# 2. W nowym terminalu - uruchom testy
npx playwright test

# 3. Zobacz HTML report dla szczegółów
npx playwright show-report

# 4. Jeśli test nadal failuje, debuguj:
npx playwright test flashcard-generation-flow.spec.ts --debug
```

---

### 📚 Dodatkowe materiały

**Utworzone pliki:**
- `e2e/TROUBLESHOOTING.md` - 300+ linii dokumentacji troubleshootingu
- `e2e/CHANGELOG.md` - Ten plik

**Zmodyfikowane pliki:**
- `e2e/pages/GeneratePage.ts` - Poprawki selektorów (3 linijki)
- `e2e/pages/LoginPage.ts` - Poprawka password selector (1 linijka)
- `e2e/DATA_TEST_IDS.md` - Dodana sekcja o selektorach (~40 linii)
- `e2e/README.md` - Rozszerzona sekcja o selektorach (~45 linii)

**Status testów:** 
- Przed: ❌ 1/8 testów failowało (nie znaleziono przycisku "Generuj fiszki")
- Po: ✅ Wszystkie selektory naprawione, gotowe do testowania

---

### 🎯 Kolejne kroki

1. **Uruchom testy** aby zweryfikować poprawki
2. **Sprawdź `.env.test`** - upewnij się że wszystkie zmienne są ustawione
3. **Opcjonalnie:** Dodaj więcej testów dla innych scenariuszy
4. **Commit changes** gdy testy przejdą pomyślnie

---

### 💡 Lekcje wyciągnięte

1. **Playwright używa aria-label jako "accessible name"** - zawsze sprawdzaj aria-label, nie tekst wewnętrzny
2. **Password inputs to specjalny przypadek** - używaj `getByLabel()` zamiast `getByRole('textbox')`
3. **Dynamiczne labels wymagają regex z wildcardami** - `.*` dla dowolnego tekstu pomiędzy
4. **error-context.md jest bezcenny** - pokazuje dokładnie jak Playwright widzi stronę
5. **Accessible selectors > data-test-id** - lepsze dla Astro + React hydratacji

---

Autorzy: AI Assistant + User
Data: 2025-10-16
Status: ✅ Gotowe do testowania

