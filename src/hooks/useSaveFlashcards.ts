import { useState } from "react";
import type { FlashcardsCreateCommand, FlashcardCreateDto } from "@/types";

interface UseSaveFlashcardsReturn {
  saveFlashcards: (flashcards: FlashcardCreateDto[]) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useSaveFlashcards(): UseSaveFlashcardsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveFlashcards = async (flashcards: FlashcardCreateDto[]): Promise<boolean> => {
    if (flashcards.length === 0) {
      setError("Brak fiszek do zapisania");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const command: FlashcardsCreateCommand = {
        flashcards,
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error("Musisz być zalogowany, aby zapisać fiszki");
        }

        if (response.status === 400) {
          const validationMessage = errorData.details
            ? errorData.details.map((d: { field: string; message: string }) => d.message).join(", ")
            : errorData.message || "Nieprawidłowe dane fiszek";
          throw new Error(validationMessage);
        }

        if (response.status === 500) {
          throw new Error(errorData.message || "Wystąpił błąd podczas zapisywania fiszek. Spróbuj ponownie.");
        }

        throw new Error("Wystąpił nieoczekiwany błąd");
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    saveFlashcards,
    isLoading,
    error,
    clearError,
  };
}
