import { useState, useCallback, useMemo } from "react";
import type { FlashcardProposalViewModel } from "@/types";
import { TextInputArea } from "./TextInputArea.tsx";
import { GenerateButton } from "./GenerateButton.tsx";
import { FlashcardList } from "./FlashcardList.tsx";
import { SkeletonLoader } from "./SkeletonLoader.tsx";
import { ErrorNotification } from "./ErrorNotification.tsx";
import { BulkSaveButton } from "./BulkSaveButton.tsx";
import { useGenerateFlashcards } from "@/hooks/useGenerateFlashcards";

export default function FlashcardGenerationView() {
  const [textValue, setTextValue] = useState("");
  const [flashcards, setFlashcards] = useState<FlashcardProposalViewModel[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);

  const { generateFlashcards, isLoading, error, clearError } = useGenerateFlashcards();

  const handleGenerate = useCallback(async () => {
    clearError();
    const result = await generateFlashcards(textValue);
    
    if (result) {
      setGenerationId(result.generation_id);
      const proposals: FlashcardProposalViewModel[] = result.flashcards_proposals.map((proposal) => ({
        front: proposal.front,
        back: proposal.back,
        source: "ai-full" as const,
        accepted: false,
        edited: false,
      }));
      setFlashcards(proposals);
    }
  }, [clearError, generateFlashcards, textValue]);

  const handleAccept = useCallback((index: number) => {
    setFlashcards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, accepted: !card.accepted } : card))
    );
  }, []);

  const handleEdit = useCallback((index: number, front: string, back: string) => {
    setFlashcards((prev) =>
      prev.map((card, i) =>
        i === index
          ? { ...card, front, back, source: "ai-edited" as const, edited: true }
          : card
      )
    );
  }, []);

  const handleReject = useCallback((index: number) => {
    setFlashcards((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveSuccess = useCallback(() => {
    setFlashcards([]);
    setTextValue("");
    setGenerationId(null);
  }, []);

  const isValidTextLength = useMemo(
    () => textValue.length >= 100 && textValue.length <= 10000,
    [textValue.length]
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-4 -mt-4 border-b">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Generuj fiszki z tekstu</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Wklej tekst (100-10000 znaków), aby wygenerować propozycje fiszek za pomocą AI
        </p>
      </header>

      {error && <ErrorNotification message={error} onClose={clearError} />}

      <div className="space-y-6">
        <TextInputArea
          value={textValue}
          onChange={setTextValue}
          isValidLength={isValidTextLength}
        />

        <GenerateButton
          onClick={handleGenerate}
          disabled={!isValidTextLength || isLoading}
          isLoading={isLoading}
        />

        {isLoading && <SkeletonLoader />}

        {!isLoading && flashcards.length > 0 && (
          <>
            <FlashcardList
              flashcards={flashcards}
              onAccept={handleAccept}
              onEdit={handleEdit}
              onReject={handleReject}
            />

            <BulkSaveButton
              flashcards={flashcards}
              generationId={generationId}
              onSaveSuccess={handleSaveSuccess}
            />
          </>
        )}
      </div>
    </div>
  );
}

