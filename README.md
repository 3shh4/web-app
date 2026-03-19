## Changelog

### LAB01
- utworzono projekt w Vite + React + TypeScript
- dodano model Project: id, nazwa, opis
- zaimplementowano CRUD projektów
- dane zapisywane są w localStorage
- dodano dedykowaną klasę ProjectStorageApi do komunikacji z pseudo API

## Lab02
- dodano mock zalogowanego użytkownika
- wyświetlanie imienia i nazwiska użytkownika
- dodano wybór aktywnego projektu
- aktywny projekt zapisywany w localStorage
- dodano CRUD historyjek powiązanych z projektem
- dodano statusy historyjek: todo / doing / done
- dodano priorytety historyjek: low / medium / high
- dodano filtrowanie historyjek po statusie
- poprawiono modele i strukturę localStorage API

### Lab03
- dodano role użytkowników: admin, devops, developer
- dodano mockowaną listę użytkowników
- dodano model zadania
- dodano CRUD zadań
- dodano widok szczegółów zadania
- dodano przypisywanie użytkownika do zadania
- dodano automatyczne zmiany statusów zadań i historyjek
- dodano tablicę kanban
- dodano zapis danych przez localStorage API