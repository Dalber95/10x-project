# Darmowe modele OpenRouter 🆓

Aplikacja **10x Flashcards** domyślnie używa **całkowicie darmowych modeli AI** do generowania fiszek!

## 🎯 Aktualnie używany model

```typescript
MODEL: "google/gemini-flash-1.5-8b:free"
```

Ten model jest:
- ✅ **Całkowicie darmowy**
- ✅ **Bardzo szybki** (odpowiedź w 2-5 sekund)
- ✅ **Stabilny i niezawodny** - doskonale wspiera JSON
- ✅ **Nie wymaga kredytów** na koncie OpenRouter
- ✅ **Od Google** - wysokiej jakości provider

## 🔄 Alternatywne darmowe modele

Możesz zmienić model na jeden z poniższych - wszystkie są **100% darmowe**:

### 1. Meta Llama 3.2 (Szybki)
```typescript
MODEL: "meta-llama/llama-3.2-3b-instruct:free"
```
- Bardzo szybki model
- Lekki i efektywny
- Może mieć problemy ze złożonym JSON schema

### 2. DeepSeek R1 (Najnowszy, 2025)
```typescript
MODEL: "deepseek/deepseek-r1:free"
```
- Bardzo mocny model z 2025 roku
- Doskonała jakość odpowiedzi
- Może być wolniejszy

### 3. Qwen 2.5 (Alternatywa)
```typescript
MODEL: "qwen/qwen-2.5-7b-instruct:free"
```
- Dobry model chińskiego pochodzenia
- Stabilny i szybki
- Dobra jakość

### 4. Llama 3.1 (Większy)
```typescript
MODEL: "meta-llama/llama-3.1-8b-instruct:free"
```
- Większy model Meta
- Lepsza jakość
- Może mieć podobne problemy jak 3.2

## 🔧 Jak zmienić model?

### Krok 1: Otwórz plik konfiguracji
```
src/lib/generation.service.ts
```

### Krok 2: Zmień linię 15
```typescript
const GENERATION_CONFIG = {
  MODEL: "google/gemini-flash-1.5-8b:free", // ← Zmień tutaj
  TIMEOUT_MS: 60000,
  USE_MOCK: import.meta.env.DEV && !import.meta.env.OPENROUTER_API_KEY,
} as const;
```

### Krok 3: Zrestartuj serwer
```bash
# Zatrzymaj dev server (Ctrl+C)
# Uruchom ponownie:
npm run dev
```

## 📊 Porównanie modeli

| Model | Szybkość | Jakość | Stabilność | Rekomendacja |
|-------|----------|--------|------------|--------------|
| gemini-flash-1.5-8b:free | ⚡⚡⚡ Bardzo szybki | ⭐⭐⭐⭐ Bardzo dobra | ✅ Wysoka | ✅ DOMYŚLNY |
| deepseek-r1:free | ⚡⚡ Średni | ⭐⭐⭐⭐⭐ Excellent | ✅ Wysoka | Najlepsza jakość |
| qwen-2.5-7b:free | ⚡⚡⚡ Bardzo szybki | ⭐⭐⭐⭐ Bardzo dobra | ✅ Wysoka | Solidny wybór |
| llama-3.2-3b:free | ⚡⚡⚡ Bardzo szybki | ⭐⭐⭐ Dobra | ⚠️ Średnia | Szybki ale niestabilny |
| llama-3.1-8b:free | ⚡⚡ Średni | ⭐⭐⭐⭐ Bardzo dobra | ⚠️ Średnia | Może mieć problemy |

## 💰 Czy kiedykolwiek będę musiał płacić?

**NIE!** Wszystkie powyższe modele są całkowicie darmowe i będą działać bez limitu (z rozsądnym użytkowaniem).

### Kiedy warto rozważyć płatne modele?

Tylko jeśli potrzebujesz:
- **GPT-4 level jakości** (bardzo zaawansowane zrozumienie)
- **Bardzo długie teksty** (>10000 znaków)
- **Specjalistyczne zadania** (medycyna, prawo, etc.)

Ale dla **99% przypadków**, darmowe modele są w zupełności wystarczające! 🎉

## 🔍 Więcej informacji

- Lista wszystkich darmowych modeli: https://openrouter.ai/models?q=free
- Dokumentacja OpenRouter: https://openrouter.ai/docs
- Twoje użycie (statystyki): https://openrouter.ai/activity

---

**Podsumowanie**: Używasz **w pełni darmowego** rozwiązania AI! 🚀

