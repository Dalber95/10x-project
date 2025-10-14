import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string }) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Validation logic
  const emailError = touched.email && email.length > 0 && !isValidEmail(email)
    ? "Nieprawidłowy format adresu email"
    : null;

  const passwordError = touched.password && password.length > 0 && password.length < 1
    ? "Hasło jest wymagane"
    : null;

  const isFormValid = isValidEmail(email) && password.length > 0;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });

    if (!isFormValid) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit({ email, password });
      } else {
        // Default behavior - call API endpoint
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Błąd podczas logowania");
        }

        // Redirect to dashboard
        window.location.href = "/generate";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isFormValid, onSubmit]);

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Zaloguj się</CardTitle>
        <CardDescription>
          Wprowadź swoje dane, aby uzyskać dostęp do konta
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Adres email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="twoj@email.com"
                className={cn("pl-10", emailError && "aria-invalid:border-destructive")}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {emailError && (
              <p id="email-error" className="text-sm text-destructive">
                {emailError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="password" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Hasło
              </label>
              <a 
                href="/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Zapomniałeś hasła?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                placeholder="••••••••"
                className={cn("pl-10", passwordError && "aria-invalid:border-destructive")}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? "password-error" : undefined}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            {passwordError && (
              <p id="password-error" className="text-sm text-destructive">
                {passwordError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || !isFormValid}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Logowanie...
              </>
            ) : (
              "Zaloguj się"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          Nie masz konta?{" "}
          <a 
            href="/register" 
            className="text-primary hover:underline font-medium"
          >
            Zarejestruj się
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

