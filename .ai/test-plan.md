
# Plan Testów Aplikacji do Generowania Fiszek

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji internetowej do generowania fiszek, zbudowanej w oparciu o technologie Astro, React, TypeScript i Supabase. Celem planu jest zapewnienie, że aplikacja spełnia wymagania funkcjonalne i niefunkcjonalne, jest stabilna, bezpieczna i zapewnia wysoką jakość doświadczenia użytkownika (UX).

### 1.2. Cele Testowania

Główne cele procesu testowania to:
*   **Weryfikacja funkcjonalności:** Upewnienie się, że wszystkie kluczowe funkcje aplikacji, takie jak rejestracja, logowanie, generowanie fiszek i zarządzanie nimi, działają zgodnie ze specyfikacją.
*   **Zapewnienie jakości:** Identyfikacja i eliminacja błędów przed wdrożeniem produkcyjnym.
*   **Ocena wydajności:** Sprawdzenie, jak aplikacja zachowuje się pod obciążeniem i czy czasy odpowiedzi są akceptowalne.
*   **Weryfikacja bezpieczeństwa:** Identyfikacja potencjalnych luk w zabezpieczeniach, szczególnie w obszarach autentykacji i autoryzacji.
*   **Zapewnienie kompatybilności:** Sprawdzenie poprawnego działania aplikacji na różnych przeglądarkach i urządzeniach.
*   **Ocena użyteczności:** Weryfikacja, czy interfejs użytkownika jest intuicyjny i przyjazny dla użytkownika.

## 2. Zakres Testów

### 2.1. Funkcjonalności objęte testami

*   **Moduł Uwierzytelniania:**
    *   Rejestracja nowych użytkowników.
    *   Logowanie i wylogowywanie.
    *   Mechanizm odzyskiwania hasła.
    *   Resetowanie hasła.
    *   Walidacja formularzy.
*   **Moduł Generowania Fiszek:**
    *   Wprowadzanie tekstu źródłowego.
    *   Proces generowania fiszek z wykorzystaniem AI (integracja z OpenRouter).
    *   Wyświetlanie wygenerowanych fiszek.
    *   Obsługa stanów pośrednich (ładowanie, błędy).
*   **Moduł Zarządzania Fiszkami:**
    *   Zapisywanie wygenerowanych fiszek na koncie użytkownika.
    *   Wyświetlanie listy zapisanych fiszek.
*   **Interfejs Użytkownika (UI/UX):**
    *   Responsywność layoutu.
    *   Poprawność wyświetlania komponentów UI.
    *   Spójność wizualna.
    *   Obsługa powiadomień (błędy, sukcesy).

### 2.2. Funkcjonalności wyłączone z testów

*   Testy wewnętrznej infrastruktury Supabase i OpenRouter (skupiamy się na testowaniu integracji z tymi usługami).
*   Testy penetracyjne (mogą być przedmiotem osobnego zlecenia).

## 3. Typy Testów

W ramach projektu przeprowadzone zostaną następujące rodzaje testów:

| Typ Testu | Opis | Narzędzia |
| :--- | :--- | :--- |
| **Testy Jednostkowe** | Weryfikacja poprawności działania pojedynczych komponentów (React) i funkcji (TypeScript) w izolacji. | Vitest, React Testing Library |
| **Testy Integracyjne** | Sprawdzenie poprawności współpracy pomiędzy różnymi modułami aplikacji (np. frontend z API, API z bazą danych Supabase). | Vitest, Supertest, React Testing Library |
| **Testy E2E (End-to-End)** | Symulacja pełnych scenariuszy użytkowania z perspektywy użytkownika końcowego, od logowania po wygenerowanie i zapisanie fiszek. | Playwright lub Cypress |
| **Testy API** | Bezpośrednie testowanie endpointów API (`/api/*`) w celu weryfikacji logiki biznesowej, obsługi błędów i kontraktu API. | Postman, Vitest z Supertest |
| **Testy Kompatybilności** | Sprawdzenie poprawnego działania aplikacji na najnowszych wersjach popularnych przeglądarek (Chrome, Firefox, Safari, Edge). | Ręczne lub z użyciem BrowserStack/Sauce Labs |
| **Testy Manualne (Eksploracyjne)** | Ręczne testowanie aplikacji w celu znalezienia błędów, które mogły zostać pominięte w testach automatycznych. | - |

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

### 4.1. Uwierzytelnianie

| ID | Opis Scenariusza | Oczekiwany Rezultat | Priorytet |
| :--- | :--- | :--- | :--- |
| AUTH-01 | Pomyślna rejestracja nowego użytkownika z poprawnymi danymi. | Użytkownik zostaje zarejestrowany i zalogowany, następuje przekierowanie na stronę główną. | Krytyczny |
| AUTH-02 | Próba rejestracji z istniejącym adresem e-mail. | Wyświetlany jest komunikat o błędzie informujący, że e-mail jest już zajęty. | Wysoki |
| AUTH-03 | Pomyślne logowanie istniejącego użytkownika. | Użytkownik zostaje zalogowany, następuje przekierowanie na stronę główną. | Krytyczny |
| AUTH-04 | Próba logowania z niepoprawnym hasłem. | Wyświetlany jest komunikat o błędzie "Nieprawidłowe dane logowania". | Wysoki |
| AUTH-05 | Użytkownik korzysta z funkcji "Zapomniałem hasła". | Użytkownik otrzymuje e-mail z linkiem do zresetowania hasła. | Wysoki |
| AUTH-06 | Pomyślne wylogowanie użytkownika. | Użytkownik zostaje wylogowany, sesja jest usuwana. | Krytyczny |

### 4.2. Generowanie Fiszek

| ID | Opis Scenariusza | Oczekiwany Rezultat | Priorytet |
| :--- | :--- | :--- | :--- |
| GEN-01 | Zalogowany użytkownik wprowadza tekst i klika "Generuj". | Po zakończeniu procesu, na ekranie pojawia się lista wygenerowanych fiszek. Przycisk zapisu jest aktywny. | Krytyczny |
| GEN-02 | Użytkownik próbuje wygenerować fiszki bez wprowadzania tekstu. | Przycisk "Generuj" jest nieaktywny lub wyświetlany jest komunikat o konieczności wprowadzenia tekstu. | Wysoki |
| GEN-03 | Występuje błąd podczas komunikacji z API OpenRouter. | Użytkownik widzi czytelny komunikat o błędzie (np. "Wystąpił błąd podczas generowania. Spróbuj ponownie."). | Wysoki |
| GEN-04 | Zalogowany użytkownik generuje fiszki, a następnie zapisuje je na swoim koncie. | Fiszki zostają zapisane w bazie danych. Użytkownik otrzymuje potwierdzenie zapisu. | Krytyczny |
| GEN-05 | Niezalogowany użytkownik próbuje zapisać fiszki. | Przycisk zapisu jest nieaktywny lub użytkownik jest proszony o zalogowanie. | Wysoki |

## 5. Środowisko Testowe

*   **Środowisko deweloperskie:** Lokalne maszyny deweloperów (`localhost`).
*   **Środowisko testowe (Staging):** Dedykowana instancja aplikacji wdrożona na platformie hostingowej (np. Vercel, Netlify, DigitalOcean), połączona z osobną, testową bazą danych Supabase. Środowisko to powinno być jak najbardziej zbliżone do środowiska produkcyjnego.
*   **Środowisko produkcyjne:** Aplikacja dostępna dla użytkowników końcowych. Na tym środowisku wykonywane będą jedynie testy dymne (smoke tests) po każdym wdrożeniu.

## 6. Narzędzia do Testowania

*   **Framework do testów jednostkowych i integracyjnych:** Vitest
*   **Biblioteka do testowania komponentów React:** React Testing Library
*   **Framework do testów E2E:** Playwright
*   **Zarządzanie projektem i zgłaszanie błędów:** Jira / Trello / GitHub Issues
*   **CI/CD:** GitHub Actions (do automatycznego uruchamiania testów po każdym pushu do repozytorium)

## 7. Harmonogram Testów

Proces testowania będzie prowadzony w sposób ciągły, zintegrowany z cyklem rozwoju oprogramowania (CI/CD).
*   **Testy jednostkowe i integracyjne:** Pisane na bieżąco przez deweloperów wraz z nowymi funkcjonalnościami. Uruchamiane automatycznie przed każdym commitem (pre-commit hook) oraz w pipeline CI.
*   **Testy E2E:** Uruchamiane automatycznie w pipeline CI po pomyślnym przejściu testów jednostkowych i integracyjnych, przed wdrożeniem na środowisko stagingowe.
*   **Testy manualne:** Przeprowadzane na środowisku stagingowym przed każdym wydaniem nowej wersji aplikacji.

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria wejścia (rozpoczęcia testów)

*   Kod źródłowy został zintegrowany i wdrożony na środowisku testowym.
*   Wszystkie testy jednostkowe i integracyjne przechodzą pomyślnie.
*   Dokumentacja dla testowanych funkcjonalności jest dostępna.

### 8.2. Kryteria wyjścia (zakończenia testów)

*   Pokrycie kodu testami jednostkowymi wynosi co najmniej 80%.
*   Wszystkie zaplanowane testy E2E dla kluczowych ścieżek użytkownika przechodzą pomyślnie.
*   Nie występują żadne błędy o priorytecie krytycznym lub wysokim.
*   Wszystkie znalezione błędy zostały zaraportowane i przypisane do odpowiednich osób.

## 9. Role i Odpowiedzialności

*   **Deweloperzy:**
    *   Pisanie testów jednostkowych i integracyjnych dla tworzonego kodu.
    *   Naprawianie błędów zgłoszonych przez zespół QA.
    *   Utrzymanie i konfiguracja środowiska testowego.
*   **Inżynier QA (Tester):**
    *   Tworzenie i utrzymanie scenariuszy testowych (manualnych i automatycznych E2E).
    *   Wykonywanie testów manualnych i eksploracyjnych.
    *   Raportowanie i weryfikacja błędów.
    *   Analiza wyników testów i przygotowywanie raportów.
*   **Project Manager / Product Owner:**
    *   Priorytetyzacja błędów.
    *   Podejmowanie decyzji o wydaniu aplikacji na produkcję na podstawie raportów z testów.

## 10. Procedury Raportowania Błędów

Każdy zidentyfikowany błąd powinien zostać zaraportowany w systemie do śledzenia błędów (np. GitHub Issues) i zawierać następujące informacje:
*   **Tytuł:** Krótki, zwięzły opis problemu.
*   **Opis:** Szczegółowy opis błędu, w tym:
    *   Kroki do odtworzenia błędu (Steps to Reproduce).
    *   Obserwowany rezultat (Actual Result).
    *   Oczekiwany rezultat (Expected Result).
*   **Środowisko:** Wersja przeglądarki, system operacyjny, na którym błąd wystąpił.
*   **Priorytet:** (Krytyczny, Wysoki, Średni, Niski)
*   **Załączniki:** Zrzuty ekranu, nagrania wideo, logi z konsoli.