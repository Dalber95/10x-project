import { useState } from "react";

interface UseDeleteFlashcardReturn {
  deleteFlashcard: (id: number) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useDeleteFlashcard(): UseDeleteFlashcardReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteFlashcard = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error("Musisz być zalogowany, aby usuwać fiszki");
        }

        if (response.status === 404) {
          throw new Error("Fiszka nie została znaleziona");
        }

        if (response.status === 500) {
          throw new Error(errorData.message || "Wystąpił błąd podczas usuwania fiszki. Spróbuj ponownie.");
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
    deleteFlashcard,
    isLoading,
    error,
    clearError,
  };
}
