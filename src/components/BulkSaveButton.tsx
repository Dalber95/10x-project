import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, CheckCheck, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { FlashcardProposalViewModel, FlashcardCreateDto } from "@/types";
import { useSaveFlashcards } from "@/hooks/useSaveFlashcards";

interface BulkSaveButtonProps {
  flashcards: FlashcardProposalViewModel[];
  generationId: number | null;
  onSaveSuccess: () => void;
}

export function BulkSaveButton({
  flashcards,
  generationId,
  onSaveSuccess,
}: BulkSaveButtonProps) {
  const { saveFlashcards, isLoading, error, clearError } = useSaveFlashcards();

  const acceptedFlashcards = flashcards.filter((f) => f.accepted);
  const hasFlashcards = flashcards.length > 0;
  const hasAcceptedFlashcards = acceptedFlashcards.length > 0;

  const handleSaveAll = async () => {
    if (!generationId) {
      return;
    }

    clearError();
    const flashcardsToSave: FlashcardCreateDto[] = flashcards.map((f) => ({
      front: f.front,
      back: f.back,
      source: f.source,
      generation_id: generationId,
    }));

    const success = await saveFlashcards(flashcardsToSave);
    if (success) {
      toast.success("Sukces!", {
        description: `Zapisano ${flashcardsToSave.length} fiszek do bazy danych.`,
      });
      onSaveSuccess();
    }
  };

  const handleSaveAccepted = async () => {
    if (!generationId) {
      return;
    }

    clearError();
    const flashcardsToSave: FlashcardCreateDto[] = acceptedFlashcards.map((f) => ({
      front: f.front,
      back: f.back,
      source: f.source,
      generation_id: generationId,
    }));

    const success = await saveFlashcards(flashcardsToSave);
    if (success) {
      toast.success("Sukces!", {
        description: `Zapisano ${flashcardsToSave.length} zaakceptowanych fiszek do bazy danych.`,
      });
      onSaveSuccess();
    }
  };

  if (!hasFlashcards) {
    return null;
  }

  return (
    <div className="space-y-4 border-t pt-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">Zapisz fiszki do bazy danych</h3>
          <p className="text-sm text-muted-foreground">
            Wybierz, które fiszki chcesz zachować
          </p>
        </div>

        <div className="flex gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSaveAll}
            disabled={isLoading || !hasFlashcards}
            aria-label={`Zapisz wszystkie ${flashcards.length} fiszek do bazy danych`}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Save />
                Zapisz wszystkie ({flashcards.length})
              </>
            )}
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={handleSaveAccepted}
            disabled={isLoading || !hasAcceptedFlashcards}
            aria-label={`Zapisz ${acceptedFlashcards.length} zaakceptowanych fiszek do bazy danych`}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                <CheckCheck />
                Zapisz zaakceptowane ({acceptedFlashcards.length})
              </>
            )}
          </Button>
        </div>
      </div>

      {hasAcceptedFlashcards && (
        <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Zaakceptowano {acceptedFlashcards.length} z {flashcards.length} fiszek
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

