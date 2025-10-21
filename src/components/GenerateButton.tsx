import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export function GenerateButton({ onClick, disabled, isLoading }: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className="w-full md:w-auto"
      aria-label={isLoading ? "Generowanie fiszek w toku" : "Rozpocznij generowanie fiszek"}
      aria-busy={isLoading}
      data-test-id="generate-flashcards-button"
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          Generowanie...
        </>
      ) : (
        <>
          <Sparkles />
          Generuj fiszki
        </>
      )}
    </Button>
  );
}
