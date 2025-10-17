# Przewodnik Zarządzania Fiszkami

## Spis treści
1. [Przeglądanie fiszek](#przeglądanie-fiszek)
2. [Edycja fiszek](#edycja-fiszek)
3. [Usuwanie fiszek](#usuwanie-fiszek)
4. [Nawigacja między stronami](#nawigacja-między-stronami)

## Przeglądanie fiszek

### Dostęp do listy fiszek
Aby wyświetlić zapisane fiszki:
1. Zaloguj się do aplikacji
2. Kliknij **"Moje fiszki"** w menu nawigacyjnym
3. Zobaczysz listę wszystkich zapisanych fiszek

### Informacje wyświetlane na liście
Dla każdej fiszki wyświetlane są:
- **Numer ID fiszki** - unikalny identyfikator
- **Źródło** - badge wskazujący pochodzenie fiszki:
  - `AI` - wygenerowana przez AI i niezmodyfikowana
  - `AI (edytowana)` - wygenerowana przez AI i następnie edytowana
  - `Ręczna` - stworzona ręcznie przez użytkownika
- **Data utworzenia** - kiedy fiszka została zapisana
- **Przód fiszki** - pytanie lub termin
- **Tył fiszki** - odpowiedź lub definicja

### Paginacja
- Domyślnie wyświetlanych jest **20 fiszek na stronę**
- Użyj przycisków **"Poprzednia"** i **"Następna"** aby nawigować między stronami
- U góry listy widoczne są informacje o aktualnej stronie i całkowitej liczbie fiszek

## Edycja fiszek

### Jak edytować fiszkę
1. Na liście fiszek znajdź fiszkę, którą chcesz edytować
2. Kliknij przycisk **"Edytuj"**
3. Wprowadź zmiany w polach:
   - **Przód fiszki** - do 200 znaków
   - **Tył fiszki** - do 500 znaków
4. Kliknij **"Zapisz"** aby zatwierdzić zmiany
5. Lub kliknij **"Anuluj"** aby odrzucić zmiany

### Walidacja podczas edycji
Podczas edycji system sprawdza:
- ✅ Pola nie mogą być puste
- ✅ Przód fiszki: maksymalnie 200 znaków
- ✅ Tył fiszki: maksymalnie 500 znaków
- ⚠️ Licznik znaków pokazuje aktualne wykorzystanie

### Co się dzieje po edycji
- Fiszka zostaje zaktualizowana w bazie danych
- Jeśli była wygenerowana przez AI, jej źródło zmienia się na `AI (edytowana)`
- Data modyfikacji zostaje zaktualizowana
- Wyświetlone zostaje powiadomienie o sukcesie

## Usuwanie fiszek

### Jak usunąć fiszkę
1. Na liście fiszek znajdź fiszkę, którą chcesz usunąć
2. Kliknij przycisk **"Usuń"**
3. Potwierdź usunięcie w wyświetlonym oknie dialogowym
4. Fiszka zostanie trwale usunięta

### Ważne informacje o usuwaniu
- ⚠️ **Usunięcie fiszki jest nieodwracalne**
- ⚠️ System poprosi o potwierdzenie przed usunięciem
- ✅ Po usunięciu lista zostanie automatycznie odświeżona
- ✅ Wyświetlone zostanie powiadomienie o sukcesie

## Nawigacja między stronami

### Menu nawigacyjne
W górnej części aplikacji znajduje się menu z opcjami:
- **Generuj fiszki** - tworzenie nowych fiszek z tekstu
- **Moje fiszki** - przeglądanie i zarządzanie zapisanymi fiszkami
- **Wyloguj** - zakończenie sesji

### Integracja z generatorem
- Po wygenerowaniu i zapisaniu fiszek możesz je później znaleźć w sekcji **"Moje fiszki"**
- Wszystkie fiszki zapisane z generatora będą miały odpowiednie źródło (`AI` lub `AI (edytowana)`)

## Wskazówki

### Najlepsze praktyki
1. **Regularnie przeglądaj swoje fiszki** - sprawdzaj czy są aktualne
2. **Edytuj fiszki dla lepszej jasności** - dostosuj je do swojego stylu nauki
3. **Usuwaj zduplikowane lub nieaktualne fiszki** - utrzymuj kolekcję w porządku
4. **Śledź źródło fiszek** - badge źródła pomoże Ci zidentyfikować pochodzenie

### Rozwiązywanie problemów

**Fiszki się nie ładują?**
- Sprawdź połączenie z internetem
- Upewnij się, że jesteś zalogowany
- Odśwież stronę

**Nie mogę edytować fiszki?**
- Upewnij się, że kliknąłeś przycisk "Edytuj"
- Sprawdź czy pola spełniają wymagania walidacji

**Usunięta fiszka nadal się wyświetla?**
- Odśwież stronę
- Sprawdź czy usunięcie zostało potwierdzone

