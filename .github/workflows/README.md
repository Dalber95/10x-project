# GitHub Actions Workflows

## Pull Request CI (`pull-request.yml`)

Automatyczny workflow uruchamiany przy każdym pull requeście do gałęzi `master`.

### Struktura workflow:

1. **Lint** - Sprawdzenie jakości kodu
2. **Unit Tests & E2E Tests** (równolegle po lincie)
   - Unit Tests: Testy jednostkowe z pokryciem kodu
   - E2E Tests: Test głównego flow generowania fiszek (`flashcard-generation-flow.spec.ts`) w przeglądarce Chromium
3. **Status Comment** - Komentarz z podsumowaniem (tylko gdy wszystkie poprzednie kroki się powiodą)

### Wymagane sekrety GitHub:

Aby workflow działał poprawnie, należy skonfigurować następujące sekrety w ustawieniach repozytorium (Settings → Secrets and variables → Actions):

#### Sekrety dla środowiska `integration`:

**Wymagane:**
- `SUPABASE_URL` - URL do instancji Supabase
- `SUPABASE_KEY` - Klucz anon do Supabase
- `OPENROUTER_API_KEY` - Klucz API do OpenRouter (wymagany dla testów generowania fiszek)
- `E2E_USERNAME` - Email użytkownika testowego (mapowany na TEST_USER_EMAIL)
- `E2E_PASSWORD` - Hasło użytkownika testowego (mapowany na TEST_USER_PASSWORD)

**Opcjonalne:**
- `E2E_USERNAME_ID` - ID użytkownika testowego (mapowany na TEST_USER_ID, używane w cleanup)

**Uwaga:** `BASE_URL` nie jest potrzebny - Playwright automatycznie uruchamia lokalny serwer dev na `localhost:3000`.

### Środowisko GitHub:

Workflow wymaga utworzenia środowiska `integration` w ustawieniach repozytorium (Settings → Environments).

### Artefakty:

Workflow generuje następujące artefakty (dostępne przez 7 dni):
- `unit-test-coverage` - Pokrycie kodu z testów jednostkowych
- `e2e-test-coverage` - Raporty Playwright
- `e2e-test-results` - Wyniki testów E2E

### Wersje akcji:

- `actions/checkout@v5`
- `actions/setup-node@v6`
- `actions/upload-artifact@v4`
- `actions/github-script@v8`

