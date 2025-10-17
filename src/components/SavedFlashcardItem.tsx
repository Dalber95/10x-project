import { useState, memo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit2, Save, XCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlashcardDto } from "@/types";

interface SavedFlashcardItemProps {
  flashcard: FlashcardDto;
  onUpdate: (id: number, front: string, back: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const SavedFlashcardItem = memo(function SavedFlashcardItem({
  flashcard,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: SavedFlashcardItemProps) {
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

  const handleSaveClick = async () => {
    if (validateFields()) {
      await onUpdate(flashcard.id, editedFront.trim(), editedBack.trim());
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

  const handleDeleteClick = async () => {
    if (
      window.confirm(
        "Czy na pewno chcesz usunąć tę fiszkę? Ta operacja jest nieodwracalna.",
      )
    ) {
      await onDelete(flashcard.id);
    }
  };

  const getSourceBadge = () => {
    switch (flashcard.source) {
      case "ai-full":
        return (
          <Badge variant="secondary" className="text-xs">
            AI
          </Badge>
        );
      case "ai-edited":
        return (
          <Badge variant="secondary" className="text-xs">
            AI (edytowana)
          </Badge>
        );
      case "manual":
        return (
          <Badge variant="outline" className="text-xs">
            Ręczna
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      className="transition-all"
      data-test-id={`saved-flashcard-item-${flashcard.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Fiszka #{flashcard.id}
            </span>
            {getSourceBadge()}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(flashcard.created_at)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor={`front-${flashcard.id}`}
            className="text-sm font-medium leading-none"
          >
            Przód fiszki
          </label>
          {isEditing ? (
            <>
              <Input
                id={`front-${flashcard.id}`}
                value={editedFront}
                onChange={(e) => setEditedFront(e.target.value)}
                placeholder="Pytanie lub termin..."
                className={cn(validationErrors.front && "border-destructive")}
                aria-invalid={!!validationErrors.front}
                aria-describedby={
                  validationErrors.front
                    ? `front-error-${flashcard.id}`
                    : undefined
                }
                disabled={isUpdating}
              />
              {validationErrors.front && (
                <p
                  id={`front-error-${flashcard.id}`}
                  className="text-sm text-destructive"
                >
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
            htmlFor={`back-${flashcard.id}`}
            className="text-sm font-medium leading-none"
          >
            Tył fiszki
          </label>
          {isEditing ? (
            <>
              <textarea
                id={`back-${flashcard.id}`}
                value={editedBack}
                onChange={(e) => setEditedBack(e.target.value)}
                placeholder="Odpowiedź lub definicja..."
                rows={4}
                className={cn(
                  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  validationErrors.back && "border-destructive",
                )}
                aria-invalid={!!validationErrors.back}
                aria-describedby={
                  validationErrors.back ? `back-error-${flashcard.id}` : undefined
                }
                disabled={isUpdating}
              />
              {validationErrors.back && (
                <p
                  id={`back-error-${flashcard.id}`}
                  className="text-sm text-destructive"
                >
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
              aria-label={`Anuluj edycję fiszki ${flashcard.id}`}
              disabled={isUpdating}
            >
              <XCircle />
              Anuluj
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveClick}
              aria-label={`Zapisz zmiany w fiszce ${flashcard.id}`}
              disabled={isUpdating}
              data-test-id={`save-flashcard-button-${flashcard.id}`}
            >
              <Save />
              {isUpdating ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              aria-label={`Edytuj fiszkę ${flashcard.id}`}
              disabled={isDeleting}
              data-test-id={`edit-flashcard-button-${flashcard.id}`}
            >
              <Edit2 />
              Edytuj
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              aria-label={`Usuń fiszkę ${flashcard.id}`}
              disabled={isDeleting}
              data-test-id={`delete-flashcard-button-${flashcard.id}`}
            >
              <Trash2 />
              {isDeleting ? "Usuwanie..." : "Usuń"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
});

