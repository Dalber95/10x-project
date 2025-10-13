# OpenRouter Service - Dokumentacja

## Przegląd

Serwis OpenRouter zapewnia integrację z API OpenRouter do generowania odpowiedzi LLM. Wspiera strukturalne wyjścia JSON, konfigurowalne modele i kompleksową obsługę błędów.

## Pliki

- `openrouter.types.ts` - Definicje typów i interfejsów
- `openrouter.service.ts` - Główna klasa serwisu i logika
- `generation.service.ts` - Integracja z systemem generowania flashcards

## Podstawowe użycie

### 1. Prosty chat

```typescript
import { createOpenRouterService } from './lib/openrouter.service';

const service = createOpenRouterService();
service.setSystemMessage('You are a helpful assistant.');
const response = await service.sendChatMessage<string>('What is AI?');
```

### 2. Strukturalne wyjście JSON

```typescript
import { createOpenRouterService } from './lib/openrouter.service';
import type { JSONSchema } from './lib/openrouter.types';

const service = createOpenRouterService({
  defaultModel: 'openai/gpt-4',
  defaultParameters: {
    temperature: 0.7,
  },
});

const schema: JSONSchema = {
  type: 'object',
  properties: {
    flashcards: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          front: { type: 'string' },
          back: { type: 'string' },
        },
        required: ['front', 'back'],
      },
    },
  },
  required: ['flashcards'],
};

service.setSystemMessage('Generate flashcards from the text.');
service.setResponseFormat(schema);

const response = await service.sendChatMessage<{
  flashcards: Array<{ front: string; back: string }>;
}>('The French Revolution was...');
```

### 3. Zmiana modelu i parametrów

```typescript
service.setModel('anthropic/claude-3-sonnet', {
  temperature: 0.5,
  top_p: 0.9,
  frequency_penalty: 0.2,
  presence_penalty: 0.1,
});
```

### 4. Pobieranie metryk

```typescript
await service.sendChatMessage('Hello!');
const metrics = service.getLastRequestMetrics();

console.log({
  duration: metrics?.requestDuration,
  tokens: metrics?.totalTokens,
  retries: metrics?.retryCount,
  success: metrics?.success,
});
```

## Konfiguracja

### Zmienne środowiskowe

W pliku `.env`:

```env
OPENROUTER_API_KEY=your_api_key_here
```

### Opcje konfiguracyjne

```typescript
interface OpenRouterServiceConfig {
  apiKey?: string;              // API key (domyślnie z OPENROUTER_API_KEY)
  baseUrl?: string;             // URL API (domyślnie OpenRouter)
  timeout?: number;             // Timeout w ms (domyślnie 60000)
  maxRetries?: number;          // Max liczba retry (domyślnie 3)
  defaultModel?: string;        // Domyślny model (domyślnie openai/gpt-4)
  defaultParameters?: {
    temperature?: number;       // 0.0 - 2.0 (domyślnie 0.7)
    top_p?: number;            // 0.0 - 1.0 (domyślnie 1.0)
    frequency_penalty?: number; // -2.0 - 2.0 (domyślnie 0.0)
    presence_penalty?: number;  // -2.0 - 2.0 (domyślnie 0.0)
  };
}
```

## Obsługa błędów

Serwis definiuje następujące typy błędów:

- `OpenRouterError` - Bazowy błąd
- `AuthenticationError` - Błąd autentykacji (401)
- `RateLimitError` - Przekroczenie limitu (429)
- `TimeoutError` - Timeout połączenia (504)
- `NetworkError` - Błąd sieciowy (503)
- `ValidationError` - Błąd walidacji (422)

### Przykład obsługi błędów

```typescript
import {
  OpenRouterError,
  AuthenticationError,
  RateLimitError,
} from './lib/openrouter.service';

try {
  const response = await service.sendChatMessage('Hello!');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded, try again later');
  } else if (error instanceof OpenRouterError) {
    console.error(`OpenRouter error: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Logowanie

W trybie development (`import.meta.env.DEV === true`), serwis automatycznie loguje:

- Rozpoczęcie i zakończenie requestów
- Błędy i retry
- Metryki wydajności

Wszystkie wrażliwe dane (klucze API, tokeny) są automatycznie usuwane z logów.

## Retry i Timeout

Serwis automatycznie retry requestów z exponential backoff:

- 1. próba: natychmiast
- 2. próba: po 1s
- 3. próba: po 2s
- 4. próba: po 4s

Błędy autentykacji, walidacji i rate limit nie są retry'owane.

## Integracja z generation.service.ts

Serwis jest zintegrowany z `generation.service.ts` do generowania flashcards:

```typescript
// Automatycznie używa OpenRouter API w produkcji
// Używa mock w dev bez OPENROUTER_API_KEY
const flashcards = await generateFlashcards(supabase, userId, sourceText);
```

Konfiguracja w `generation.service.ts`:

```typescript
const GENERATION_CONFIG = {
  MODEL: "openai/gpt-3.5-turbo",
  TIMEOUT_MS: 60000,
  USE_MOCK: import.meta.env.DEV && !import.meta.env.OPENROUTER_API_KEY,
};
```

## Bezpieczeństwo

1. **Klucze API** - Przechowywane w zmiennych środowiskowych
2. **Logowanie** - Wrażliwe dane są automatycznie usuwane
3. **Walidacja** - Wszystkie odpowiedzi są walidowane przed zwróceniem
4. **Timeout** - Domyślny timeout 60s zapobiega zawieszeniu

## Modele

Przykłady dostępnych modeli:

- `openai/gpt-4` - GPT-4 (najlepsze wyniki)
- `openai/gpt-3.5-turbo` - GPT-3.5 (szybszy, tańszy)
- `anthropic/claude-3-sonnet` - Claude 3 Sonnet
- `anthropic/claude-3-opus` - Claude 3 Opus
- `google/gemini-pro` - Google Gemini Pro

Pełna lista: https://openrouter.ai/models

## Metryki

Każdy request zbiera następujące metryki:

```typescript
interface RequestMetrics {
  model: string;              // Użyty model
  requestDuration: number;    // Czas trwania w ms
  promptTokens?: number;      // Tokeny w prompcie
  completionTokens?: number;  // Tokeny w odpowiedzi
  totalTokens?: number;       // Suma tokenów
  retryCount: number;         // Liczba retry
  success: boolean;           // Czy request się powiódł
}
```

## Licencja

Ten kod jest częścią projektu 10x Flashcards.

