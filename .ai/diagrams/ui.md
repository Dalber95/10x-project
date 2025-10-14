<architecture_analysis>
Na podstawie dostarczonych dokumentów (`prd.md`, `auth-spec.md`) oraz zasad tworzenia diagramów (`mermaid-diagram-ui.mdc`), przeprowadzono analizę architektury UI dla modułu autentykacji.

### 1. Komponenty i Strony

Zidentyfikowano następujące elementy UI:

**Strony Publiczne (Astro):**
- `src/pages/login.astro`: Strona logowania.
- `src/pages/register.astro`: Strona rejestracji.
- `src/pages/forgot-password.astro`: Strona do inicjowania resetu hasła.
- `src/pages/reset-password.astro`: Strona do ustawiania nowego hasła po resecie.

**Komponenty Interaktywne (React):**
- `LoginForm.tsx`: Formularz logowania z walidacją po stronie klienta.
- `RegisterForm.tsx`: Formularz rejestracji z walidacją.
- `PasswordRecoveryForm.tsx`: Formularz do wysyłania prośby o reset hasła.
- `ResetPasswordForm.tsx`: Formularz do zmiany hasła przy użyciu tokenu.

**Layouty (Astro):**
- `src/layouts/Layout.astro`: Główny layout dla stron publicznych.
- `src/layouts/AuthLayout.astro`: Layout dla stron wymagających autoryzacji.

**Middleware (Astro):**
- `src/middleware/index.ts`: Oprogramowanie pośredniczące, które chroni trasy prywatne i zarządza sesją.

### 2. Główne Strony i Powiązane Komponenty

- Strona `/login` renderuje komponent `LoginForm`.
- Strona `/register` renderuje komponent `RegisterForm`.
- Strona `/forgot-password` renderuje komponent `PasswordRecoveryForm`.
- Strona `/reset-password` renderuje komponent `ResetPasswordForm`.
- Strony takie jak `/generate` (i inne prywatne) będą używać `AuthLayout.astro` i będą chronione przez middleware.

### 3. Przepływ Danych

1.  **Użytkownik** wchodzi na jedną ze stron publicznych (np. `/login`).
2.  **Strona Astro** (`login.astro`) renderuje odpowiedni **komponent React** (`LoginForm`).
3.  Użytkownik wypełnia formularz. **Komponent React** waliduje dane po stronie klienta.
4.  Po pomyślnej walidacji, komponent wysyła żądanie (np. `POST`) do odpowiedniego **API endpointu** (np. `/api/auth/login`).
5.  **API endpoint** (Astro) przetwarza żądanie, komunikując się z **Supabase Auth** w celu weryfikacji poświadczeń.
6.  Po pomyślnej autentykacji, Supabase tworzy sesję (zapisywaną w `HttpOnly cookie`).
7.  Aplikacja frontendowa przekierowuje użytkownika na stronę prywatną (np. `/generate`).
8.  Żądanie dostępu do strony prywatnej jest przechwytywane przez **Astro Middleware**.
9.  **Middleware** weryfikuje sesję użytkownika na podstawie cookie. Jeśli sesja jest ważna, dostęp jest przyznawany. W przeciwnym razie, użytkownik jest przekierowywany na stronę logowania (`/login`).

### 4. Funkcjonalność Komponentów

- **LoginForm/RegisterForm**: Zbieranie i walidacja danych uwierzytelniających, obsługa stanu ładowania i błędów, komunikacja z API.
- **PasswordRecoveryForm**: Zbieranie adresu e-mail i wysyłanie żądania o link do resetu hasła.
- **ResetPasswordForm**: Umożliwienie użytkownikowi ustawienia nowego hasła na podstawie tokenu z linku.
- **Middleware**: Centralny punkt kontroli dostępu do zasobów chronionych.
- **AuthLayout**: Wspólna struktura dla wszystkich stron po zalogowaniu, potencjalnie zawierająca nawigację i przycisk wylogowania.
</architecture_analysis>

<mermaid_diagram>
```mermaid
flowchart TD
    subgraph "Użytkownik"
        direction LR
        U[Niezalogowany Użytkownik]
        U_LOGGED_IN[Zalogowany Użytkownik]
    end

    subgraph "Strefa Publiczna (Strony Astro)"
        P_LOGIN["/login.astro"]
        P_REGISTER["/register.astro"]
        P_FORGOT["/forgot-password.astro"]
        P_RESET["/reset-password.astro"]
    end

    subgraph "Komponenty UI (React)"
        C_LOGIN["LoginForm.tsx"]
        C_REGISTER["RegisterForm.tsx"]
        C_FORGOT["PasswordRecoveryForm.tsx"]
        C_RESET["ResetPasswordForm.tsx"]
    end

    subgraph "Strefa Prywatna (Chronione Strony Astro)"
        P_GENERATE["/generate.astro"]
        P_OTHER["Inne Strony Prywatne"]
        L_AUTH["AuthLayout.astro"]
    end

    subgraph "Logika Serwerowa (Astro)"
        MW["Middleware (index.ts)"]
        subgraph "API Autentykacji (/api/auth/*)"
            API_LOGIN["POST /login"]
            API_REGISTER["POST /register"]
            API_LOGOUT["POST /logout"]
            API_FORGOT["POST /forgot-password"]
            API_RESET["POST /reset-password"]
        end
    end

    subgraph "Dostawca Autentykacji"
        SUPABASE["Supabase Auth"]
    end

    %% Przepływy
    U -- "Odwiedza stronę logowania" --> P_LOGIN
    P_LOGIN -- "Renderuje" --> C_LOGIN
    U -- "Odwiedza stronę rejestracji" --> P_REGISTER
    P_REGISTER -- "Renderuje" --> C_REGISTER
    
    C_LOGIN -- "Wysyła dane formularza" --> API_LOGIN
    C_REGISTER -- "Wysyła dane formularza" --> API_REGISTER
    C_FORGOT -- "Wysyła email" --> API_FORGOT
    C_RESET -- "Wysyła nowe hasło i token" --> API_RESET

    API_LOGIN -- "Weryfikuje poświadczenia" --> SUPABASE
    API_REGISTER -- "Tworzy użytkownika" --> SUPABASE
    API_FORGOT -- "Wysyła link resetujący" --> SUPABASE
    API_RESET -- "Resetuje hasło" --> SUPABASE

    SUPABASE -- "Sukces" --> API_LOGIN
    SUPABASE -- "Sukces" --> API_REGISTER

    API_LOGIN -- "Przekierowanie" --> P_GENERATE
    API_REGISTER -- "Przekierowanie" --> P_GENERATE

    U_LOGGED_IN -- "Próba dostępu" --> P_GENERATE
    P_GENERATE -- "Używa" --> L_AUTH
    P_OTHER -- "Używa" --> L_AUTH
    L_AUTH -- "Przycisk Wyloguj" --> API_LOGOUT
    API_LOGOUT -- "Kończy sesję" --> SUPABASE
    API_LOGOUT -- "Przekierowuje" --> P_LOGIN

    
    %% Ochrona przez Middleware
    U -- "Próba dostępu do /generate" --> MW
    U_LOGGED_IN -- "Dostęp do /generate" --> MW

    MW -- "Brak sesji" --> P_LOGIN
    MW -- "Sesja aktywna" --> P_GENERATE
```
</mermaid_diagram>
