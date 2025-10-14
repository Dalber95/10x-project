import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Błąd podczas wylogowania");
      }

      toast.success("Wylogowano pomyślnie");
      
      // Przekieruj do strony logowania
      window.location.href = "/login";
    } catch (error) {
      toast.error("Nie udało się wylogować. Spróbuj ponownie.");
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          Wylogowanie...
        </>
      ) : (
        <>
          <LogOut />
          Wyloguj się
        </>
      )}
    </Button>
  );
}

