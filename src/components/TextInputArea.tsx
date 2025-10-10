import { cn } from "@/lib/utils";

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  isValidLength: boolean;
}

export function TextInputArea({ value, onChange, isValidLength }: TextInputAreaProps) {
  const characterCount = value.length;
  const minChars = 1000;
  const maxChars = 10000;

  const getValidationMessage = () => {
    if (characterCount === 0) {
      return `Wprowadź tekst (minimum ${minChars} znaków)`;
    }
    if (characterCount < minChars) {
      return `Wprowadzono ${characterCount} / ${minChars} znaków (minimum)`;
    }
    if (characterCount > maxChars) {
      return `Przekroczono limit: ${characterCount} / ${maxChars} znaków (maksimum)`;
    }
    return `${characterCount} / ${maxChars} znaków`;
  };

  const validationMessageClass = cn(
    "text-sm mt-2",
    characterCount > maxChars
      ? "text-destructive"
      : characterCount >= minChars
        ? "text-green-600 dark:text-green-400"
        : "text-muted-foreground"
  );

  return (
    <div className="space-y-2">
      <label htmlFor="source-text" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Tekst źródłowy
      </label>
      <textarea
        id="source-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Wklej tutaj tekst, z którego chcesz wygenerować fiszki..."
        className={cn(
          "flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors",
          characterCount > maxChars && "border-destructive focus-visible:ring-destructive"
        )}
        aria-describedby="character-count"
        aria-invalid={characterCount > maxChars}
      />
      <p id="character-count" className={validationMessageClass}>
        {getValidationMessage()}
      </p>
    </div>
  );
}

