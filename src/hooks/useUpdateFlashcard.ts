import { useState } from "react";
import type { FlashcardUpdateDto, FlashcardDto } from "@/types";

interface UseUpdateFlashcardReturn {
  updateFlashcard: (id: number, updateData: FlashcardUpdateDto) => Promise<FlashcardDto | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useUpdateFlashcard(): UseUpdateFlashcardReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFlashcard = async (id: number, updateData: FlashcardUpdateDto): Promise<FlashcardDto | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error("Musisz być zalogowany, aby edytować fiszki");
        }

        if (response.status === 404) {
          throw new Error("Fiszka nie została znaleziona");
        }

        if (response.status === 400) {
          const validationMessage = errorData.details
            ? errorData.details.map((d: { field: string; message: string }) => d.message).join(", ")
            : errorData.message || "Nieprawidłowe dane fiszki";
          throw new Error(validationMessage);
        }

        if (response.status === 500) {
          throw new Error(errorData.message || "Wystąpił błąd podczas aktualizacji fiszki. Spróbuj ponownie.");
        }

        throw new Error("Wystąpił nieoczekiwany błąd");
      }

      const data: FlashcardDto = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    updateFlashcard,
    isLoading,
    error,
    clearError,
  };
}
