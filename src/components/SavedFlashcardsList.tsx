import { useState, useCallback } from "react";
import { SavedFlashcardItem } from "./SavedFlashcardItem";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useUpdateFlashcard } from "@/hooks/useUpdateFlashcard";
import { useDeleteFlashcard } from "@/hooks/useDeleteFlashcard";
import { toast } from "sonner";
import { SkeletonLoader } from "./SkeletonLoader";

export function SavedFlashcardsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { flashcards, pagination, isLoading, error: fetchError, refetch } = useFlashcards(currentPage, 20, true);

  const { updateFlashcard, error: updateError, clearError: clearUpdateError } = useUpdateFlashcard();

  const { deleteFlashcard, error: deleteError, clearError: clearDeleteError } = useDeleteFlashcard();

  const handleUpdate = useCallback(
    async (id: number, front: string, back: string) => {
      setUpdatingId(id);
      clearUpdateError();

      const result = await updateFlashcard(id, { front, back });

      if (result) {
        toast.success("Fiszka została zaktualizowana pomyślnie");
        await refetch(currentPage, 20);
      } else if (updateError) {
        toast.error(updateError);
      }

      setUpdatingId(null);
    },
    [updateFlashcard, updateError, clearUpdateError, refetch, currentPage]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      setDeletingId(id);
      clearDeleteError();

      const result = await deleteFlashcard(id);

      if (result) {
        toast.success("Fiszka została usunięta pomyślnie");
        await refetch(currentPage, 20);
      } else if (deleteError) {
        toast.error(deleteError);
      }

      setDeletingId(null);
    },
    [deleteFlashcard, deleteError, clearDeleteError, refetch, currentPage]
  );

  const handlePreviousPage = async () => {
    if (pagination && currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      await refetch(newPage, 20);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = async () => {
    if (pagination && currentPage * pagination.limit < pagination.total) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      await refetch(newPage, 20);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isLoading && flashcards.length === 0) {
    return (
      <div className="space-y-4">
        <SkeletonLoader count={3} />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive" role="alert">
        <p className="font-medium">Wystąpił błąd podczas ładowania fiszek</p>
        <p className="mt-1">{fetchError}</p>
        <Button variant="outline" size="sm" onClick={() => refetch(currentPage, 20)} className="mt-3">
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Nie masz jeszcze żadnych zapisanych fiszek.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Przejdź do{" "}
          <a href="/generate" className="underline hover:text-foreground">
            generatora
          </a>
          , aby stworzyć swoje pierwsze fiszki.
        </p>
      </div>
    );
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;
  const hasNextPage = pagination ? currentPage * pagination.limit < pagination.total : false;
  const hasPreviousPage = currentPage > 1;

  return (
    <div className="space-y-6">
      {/* Stats */}
      {pagination && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Wyświetlanie {flashcards.length} z {pagination.total} fiszek
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Strona {currentPage} z {totalPages}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Flashcards list */}
      <div className="space-y-4">
        {flashcards.map((flashcard) => (
          <SavedFlashcardItem
            key={flashcard.id}
            flashcard={flashcard}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isUpdating={updatingId === flashcard.id}
            isDeleting={deletingId === flashcard.id}
          />
        ))}
      </div>

      {/* Pagination controls */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage || isLoading}
            aria-label="Poprzednia strona"
          >
            <ChevronLeft />
            Poprzednia
          </Button>

          <span className="text-sm text-muted-foreground px-4">
            {currentPage} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasNextPage || isLoading}
            aria-label="Następna strona"
          >
            Następna
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
