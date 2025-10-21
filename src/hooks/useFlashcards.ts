import { useState, useEffect, useCallback } from "react";
import type { FlashcardsListResponseDto, FlashcardDto } from "@/types";

interface UseFlashcardsReturn {
  flashcards: FlashcardDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  refetch: (page?: number, limit?: number) => Promise<void>;
  clearError: () => void;
}

export function useFlashcards(initialPage = 1, initialLimit = 20, autoFetch = true): UseFlashcardsReturn {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(
    async (page: number = initialPage, limit: number = initialLimit) => {
      setIsLoading(true);
      setError(null);

      try {
        const url = new URL("/api/flashcards", window.location.origin);
        url.searchParams.set("page", page.toString());
        url.searchParams.set("limit", limit.toString());

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 401) {
            throw new Error("Musisz być zalogowany, aby wyświetlić fiszki");
          }

          if (response.status === 400) {
            throw new Error(errorData.message || "Nieprawidłowe parametry zapytania");
          }

          if (response.status === 500) {
            throw new Error(errorData.message || "Wystąpił błąd podczas pobierania fiszek. Spróbuj ponownie.");
          }

          throw new Error("Wystąpił nieoczekiwany błąd");
        }

        const data: FlashcardsListResponseDto = await response.json();
        setFlashcards(data.data);
        setPagination(data.pagination);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd";
        setError(errorMessage);
        setFlashcards([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    },
    [initialPage, initialLimit]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchFlashcards(initialPage, initialLimit);
    }
  }, [autoFetch, fetchFlashcards, initialPage, initialLimit]);

  const clearError = () => {
    setError(null);
  };

  return {
    flashcards,
    pagination,
    isLoading,
    error,
    refetch: fetchFlashcards,
    clearError,
  };
}
