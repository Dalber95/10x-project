import { useState } from "react";
import type { GenerateFlashcardsCommand, GenerationCreateResponseDto } from "@/types";

interface UseGenerateFlashcardsReturn {
  generateFlashcards: (sourceText: string) => Promise<GenerationCreateResponseDto | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useGenerateFlashcards(): UseGenerateFlashcardsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFlashcards = async (sourceText: string): Promise<GenerationCreateResponseDto | null> => {
    // Validate text length before API call
    if (sourceText.length < 100 || sourceText.length > 10000) {
      setError("Tekst musi zawierać od 100 do 10000 znaków");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const command: GenerateFlashcardsCommand = {
        source_text: sourceText,
      };

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new Error("Musisz być zalogowany, aby generować fiszki");
        }
        
        if (response.status === 400) {
          const validationMessage = errorData.details
            ? errorData.details.map((d: { field: string; message: string }) => d.message).join(", ")
            : errorData.message || "Nieprawidłowe dane wejściowe";
          throw new Error(validationMessage);
        }

        if (response.status === 500) {
          throw new Error(errorData.message || "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie.");
        }

        throw new Error("Wystąpił nieoczekiwany błąd");
      }

      const data: GenerationCreateResponseDto = await response.json();
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
    generateFlashcards,
    isLoading,
    error,
    clearError,
  };
}

