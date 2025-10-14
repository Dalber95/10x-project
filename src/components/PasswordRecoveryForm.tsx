import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRecoveryFormProps {
  onSubmit?: (data: { email: string }) => Promise<void>;
}

export function PasswordRecoveryForm({ onSubmit }: PasswordRecoveryFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState(false);

  // Validation logic
  const emailError = touched && email.length > 0 && !isValidEmail(email)
    ? "Nieprawidłowy format adresu email"
    : null;

  const isFormValid = isValidEmail(email);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched(true);

    if (!isFormValid) {
      return;
    }

    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit({ email });
      } else {
        // Default behavior - call API endpoint
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Błąd podczas wysyłania linku resetującego");
        }
      }

      setSuccess(true);
      setEmail("");
      setTouched(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
    } finally {
      setIsLoading(false);
    }
  }, [email, isFormValid, onSubmit]);

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Odzyskiwanie hasła</CardTitle>
        <CardDescription>
          Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła
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

          {success && (
            <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Link do resetowania hasła został wysłany na podany adres email. Sprawdź swoją skrzynkę pocztową.
              </AlertDescription>
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
                onBlur={handleBlur}
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
                Wysyłanie...
              </>
            ) : (
              "Wyślij link resetujący"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          <a 
            href="/login" 
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Wróć do logowania
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

