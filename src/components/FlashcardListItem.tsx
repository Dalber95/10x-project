import { useState, memo } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Edit2, X, Save, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlashcardProposalViewModel } from "@/types";

interface FlashcardListItemProps {
  flashcard: FlashcardProposalViewModel;
  index: number;
  onAccept: (index: number) => void;
  onEdit: (index: number, front: string, back: string) => void;
  onReject: (index: number) => void;
}

export const FlashcardListItem = memo(function FlashcardListItem({
  flashcard,
  index,
  onAccept,
  onEdit,
  onReject,
}: FlashcardListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(flashcard.front);
  const [editedBack, setEditedBack] = useState(flashcard.back);
  const [validationErrors, setValidationErrors] = useState<{
    front?: string;
    back?: string;
  }>({});

  const validateFields = (): boolean => {
    const errors: { front?: string; back?: string } = {};

    if (editedFront.trim().length === 0) {
      errors.front = "Przód fiszki nie może być pusty";
    } else if (editedFront.length > 200) {
      errors.front = `Przód fiszki może mieć maksymalnie 200 znaków (obecnie: ${editedFront.length})`;
    }

    if (editedBack.trim().length === 0) {
      errors.back = "Tył fiszki nie może być pusty";
    } else if (editedBack.length > 500) {
      errors.back = `Tył fiszki może mieć maksymalnie 500 znaków (obecnie: ${editedBack.length})`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
    setValidationErrors({});
  };

  const handleSaveClick = () => {
    if (validateFields()) {
      onEdit(index, editedFront.trim(), editedBack.trim());
      setIsEditing(false);
      setValidationErrors({});
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
    setValidationErrors({});
  };

  return (
    <Card
      className={cn(
        "transition-all",
        flashcard.accepted && "border-green-500 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Fiszka #{index + 1}
            </span>
            {flashcard.edited && (
              <Badge variant="secondary" className="text-xs">
                Edytowana
              </Badge>
            )}
            {flashcard.accepted && (
              <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                <Check className="w-3 h-3 mr-1" />
                Zaakceptowana
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor={`front-${index}`}
            className="text-sm font-medium leading-none"
          >
            Przód fiszki
          </label>
          {isEditing ? (
            <>
              <Input
                id={`front-${index}`}
                value={editedFront}
                onChange={(e) => setEditedFront(e.target.value)}
                placeholder="Pytanie lub termin..."
                className={cn(validationErrors.front && "border-destructive")}
                aria-invalid={!!validationErrors.front}
                aria-describedby={validationErrors.front ? `front-error-${index}` : undefined}
              />
              {validationErrors.front && (
                <p id={`front-error-${index}`} className="text-sm text-destructive">
                  {validationErrors.front}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {editedFront.length} / 200 znaków
              </p>
            </>
          ) : (
            <div className="p-3 rounded-md bg-muted text-sm min-h-[60px] whitespace-pre-wrap">
              {flashcard.front}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`back-${index}`}
            className="text-sm font-medium leading-none"
          >
            Tył fiszki
          </label>
          {isEditing ? (
            <>
              <textarea
                id={`back-${index}`}
                value={editedBack}
                onChange={(e) => setEditedBack(e.target.value)}
                placeholder="Odpowiedź lub definicja..."
                rows={4}
                className={cn(
                  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  validationErrors.back && "border-destructive"
                )}
                aria-invalid={!!validationErrors.back}
                aria-describedby={validationErrors.back ? `back-error-${index}` : undefined}
              />
              {validationErrors.back && (
                <p id={`back-error-${index}`} className="text-sm text-destructive">
                  {validationErrors.back}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {editedBack.length} / 500 znaków
              </p>
            </>
          ) : (
            <div className="p-3 rounded-md bg-muted text-sm min-h-[100px] whitespace-pre-wrap">
              {flashcard.back}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 justify-end pt-4 border-t">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              aria-label={`Anuluj edycję fiszki ${index + 1}`}
            >
              <XCircle />
              Anuluj
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveClick}
              aria-label={`Zapisz zmiany w fiszce ${index + 1}`}
            >
              <Save />
              Zapisz
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAccept(index)}
              className={cn(
                flashcard.accepted && "border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
              )}
              aria-label={flashcard.accepted ? `Odznacz fiszkę ${index + 1}` : `Zaakceptuj fiszkę ${index + 1}`}
            >
              <Check />
              {flashcard.accepted ? "Zaakceptowana" : "Zaakceptuj"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              aria-label={`Edytuj fiszkę ${index + 1}`}
            >
              <Edit2 />
              Edytuj
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onReject(index)}
              aria-label={`Odrzuć fiszkę ${index + 1}`}
            >
              <X />
              Odrzuć
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
});

