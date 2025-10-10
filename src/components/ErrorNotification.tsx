import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";

interface ErrorNotificationProps {
  message: string;
  title?: string;
  onClose?: () => void;
}

export function ErrorNotification({
  message,
  title = "Wystąpił błąd",
  onClose,
}: ErrorNotificationProps) {
  if (!message) return null;

  return (
    <Alert variant="destructive" className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {message}
      </AlertDescription>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onClose}
          aria-label="Zamknij komunikat"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}

