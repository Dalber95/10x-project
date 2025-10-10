import type { FlashcardProposalViewModel } from "@/types";
import { FlashcardListItem } from "./FlashcardListItem";

interface FlashcardListProps {
  flashcards: FlashcardProposalViewModel[];
  onAccept: (index: number) => void;
  onEdit: (index: number, front: string, back: string) => void;
  onReject: (index: number) => void;
}

export function FlashcardList({
  flashcards,
  onAccept,
  onEdit,
  onReject,
}: FlashcardListProps) {
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">
          Brak wygenerowanych fiszek. Wprowadź tekst i kliknij "Generuj fiszki".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Wygenerowane propozycje ({flashcards.length})
        </h2>
        <p className="text-sm text-muted-foreground">
          Zaakceptowano: {flashcards.filter((f) => f.accepted).length} / {flashcards.length}
        </p>
      </div>

      <div className="space-y-4">
        {flashcards.map((flashcard, index) => (
          <FlashcardListItem
            key={index}
            flashcard={flashcard}
            index={index}
            onAccept={onAccept}
            onEdit={onEdit}
            onReject={onReject}
          />
        ))}
      </div>
    </div>
  );
}

