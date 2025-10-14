# Diagram przepływu interfejsu autentykacji

```mermaid
flowchart TD
    Start([Użytkownik wchodzi na stronę]) --> CheckAuth{Czy zalogowany?}
    
    CheckAuth -->|Nie| Landing[Strona główna /]
    CheckAuth -->|Tak| Dashboard[/generate - Generator fiszek]
    
    Landing --> ChooseAuth{Wybór akcji}
    
    ChooseAuth --> Login[/login - Strona logowania]
    ChooseAuth --> Register[/register - Strona rejestracji]
    
    %% Rejestracja
    Register --> RegisterForm[RegisterForm<br/>- Email<br/>- Hasło<br/>- Potwierdź hasło]
    RegisterForm --> ValidateReg{Walidacja}
    ValidateReg -->|Błąd| ShowRegError[Komunikat błędu]
    ShowRegError --> RegisterForm
    ValidateReg -->|OK| SubmitReg[POST /api/auth/register]
    SubmitReg --> RegSuccess{Sukces?}
    RegSuccess -->|Nie| ShowRegAPIError[Alert z błędem API]
    ShowRegAPIError --> RegisterForm
    RegSuccess -->|Tak| Dashboard
    
    %% Logowanie
    Login --> LoginForm[LoginForm<br/>- Email<br/>- Hasło]
    LoginForm --> ForgotLink{Zapomniałeś<br/>hasła?}
    ForgotLink -->|Tak| ForgotPassword[/forgot-password<br/>Odzyskiwanie hasła]
    ForgotLink -->|Nie| ValidateLogin{Walidacja}
    ValidateLogin -->|Błąd| ShowLoginError[Komunikat błędu]
    ShowLoginError --> LoginForm
    ValidateLogin -->|OK| SubmitLogin[POST /api/auth/login]
    SubmitLogin --> LoginSuccess{Sukces?}
    LoginSuccess -->|Nie| ShowLoginAPIError[Alert z błędem API]
    ShowLoginAPIError --> LoginForm
    LoginSuccess -->|Tak| Dashboard
    
    %% Odzyskiwanie hasła
    ForgotPassword --> RecoveryForm[PasswordRecoveryForm<br/>- Email]
    RecoveryForm --> ValidateEmail{Walidacja<br/>email}
    ValidateEmail -->|Błąd| ShowEmailError[Komunikat błędu]
    ShowEmailError --> RecoveryForm
    ValidateEmail -->|OK| SubmitRecovery[POST /api/auth/forgot-password]
    SubmitRecovery --> RecoverySuccess{Sukces?}
    RecoverySuccess -->|Nie| ShowRecoveryError[Alert z błędem]
    ShowRecoveryError --> RecoveryForm
    RecoverySuccess -->|Tak| ShowSuccess[Zielony alert<br/>Link wysłany na email]
    ShowSuccess --> EmailSent[Email z linkiem]
    
    EmailSent --> ClickLink[Użytkownik klika link]
    ClickLink --> ResetPassword[/reset-password?token=XXX<br/>Resetowanie hasła]
    
    %% Resetowanie hasła
    ResetPassword --> CheckToken{Token<br/>prawidłowy?}
    CheckToken -->|Nie| ShowTokenError[Alert: Nieprawidłowy token<br/>Przycisk: Wyślij nowy link]
    ShowTokenError --> ForgotPassword
    CheckToken -->|Tak| ResetForm[ResetPasswordForm<br/>- Nowe hasło<br/>- Potwierdź hasło]
    ResetForm --> ValidateReset{Walidacja}
    ValidateReset -->|Błąd| ShowResetError[Komunikat błędu]
    ShowResetError --> ResetForm
    ValidateReset -->|OK| SubmitReset[POST /api/auth/reset-password]
    SubmitReset --> ResetSuccess{Sukces?}
    ResetSuccess -->|Nie| ShowResetAPIError[Alert z błędem]
    ShowResetAPIError --> ResetForm
    ResetSuccess -->|Tak| ShowResetSuccess[Zielony alert<br/>Hasło zresetowane]
    ShowResetSuccess --> AutoRedirect[Przekierowanie po 3s]
    AutoRedirect --> Login
    
    %% Nawigacja między stronami
    Register -.->|Link: Masz konto?| Login
    Login -.->|Link: Nie masz konta?| Register
    RecoveryForm -.->|Link: Wróć| Login
    ResetForm -.->|Link: Pamiętasz hasło?| Login

    style RegisterForm fill:#e3f2fd
    style LoginForm fill:#e3f2fd
    style RecoveryForm fill:#e3f2fd
    style ResetForm fill:#e3f2fd
    style Dashboard fill:#c8e6c9
    style ShowSuccess fill:#c8e6c9
    style ShowResetSuccess fill:#c8e6c9
    style ShowRegError fill:#ffcdd2
    style ShowLoginError fill:#ffcdd2
    style ShowEmailError fill:#ffcdd2
    style ShowResetError fill:#ffcdd2
    style ShowRegAPIError fill:#ffcdd2
    style ShowLoginAPIError fill:#ffcdd2
    style ShowRecoveryError fill:#ffcdd2
    style ShowResetAPIError fill:#ffcdd2
    style ShowTokenError fill:#ffcdd2
```

## Legenda kolorów

- 🔵 **Niebieski** - Formularze interaktywne (React)
- 🟢 **Zielony** - Stany sukcesu
- 🔴 **Czerwony** - Stany błędu
- ⚪ **Biały** - Decyzje i przepływy

## Kluczowe punkty nawigacji

### 1. Rejestracja → Logowanie
- Link: "Masz już konto? **Zaloguj się**"
- Lokalizacja: Card Footer w RegisterForm

### 2. Logowanie → Rejestracja
- Link: "Nie masz konta? **Zarejestruj się**"
- Lokalizacja: Card Footer w LoginForm

### 3. Logowanie → Odzyskiwanie hasła
- Link: "**Zapomniałeś hasła?**"
- Lokalizacja: Obok labela "Hasło" w LoginForm

### 4. Odzyskiwanie hasła → Logowanie
- Link: "← **Wróć do logowania**"
- Lokalizacja: Card Footer w PasswordRecoveryForm

### 5. Resetowanie hasła → Logowanie
- Link: "Pamiętasz hasło? **Zaloguj się**"
- Lokalizacja: Card Footer w ResetPasswordForm
- Automatyczne przekierowanie po sukcesie (3s)

## Walidacja w czasie rzeczywistym

### RegisterForm
1. Email: format email (regex)
2. Hasło: minimum 8 znaków
3. Potwierdzenie: zgodność z hasłem
4. Wizualna wskazówka: ✓ "Hasła są zgodne" (zielona)

### LoginForm
1. Email: format email (regex)
2. Hasło: pole niepuste

### PasswordRecoveryForm
1. Email: format email (regex)

### ResetPasswordForm
1. Token: sprawdzanie w URL przy montowaniu
2. Hasło: minimum 8 znaków
3. Potwierdzenie: zgodność z hasłem
4. Wizualna wskazówka: ✓ "Hasła są zgodne" (zielona)

## Komunikaty użytkownika

### Błędy walidacji (pod polami)
- "Nieprawidłowy format adresu email"
- "Hasło musi mieć co najmniej 8 znaków"
- "Hasła nie są zgodne"
- "Hasło jest wymagane"

### Błędy API (Alert czerwony)
- "Błąd podczas rejestracji"
- "Błąd podczas logowania"
- "Błąd podczas wysyłania linku resetującego"
- "Błąd podczas resetowania hasła"
- "Nieprawidłowy lub brakujący token resetowania hasła"

### Sukces (Alert zielony)
- "Link do resetowania hasła został wysłany na podany adres email. Sprawdź swoją skrzynkę pocztową."
- "Hasło zostało pomyślnie zresetowane. Za chwilę zostaniesz przekierowany do strony logowania."

### Wskazówki (szary tekst)
- "Minimum 8 znaków" (pod polem hasła)
- ✓ "Hasła są zgodne" (zielony, gdy hasła się zgadzają)

