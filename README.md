Better BT - Integrated Business Trip System
Projekt Inżynierski System do kompleksowego zarządzania podróżami służbowymi, rozliczania delegacji i raportowania.
🎯 Główne Założenia (Student Mode)
Ten projekt ma na celu spełnienie konkretnych wymagań uczelnianych (tzw. "ZSI"). Najważniejsza zasada: Projekt ma działać i spełniać kryteria ilościowe (tabele, widoki), a nie być idealnym kodem enterprise.
Cel: Zaliczenie przedmiotu i obrona pracy inżynierskiej.
Podejście: "Done is better than perfect". Skupiamy się na liczbie widoków i tabelach.
Architektura: Monorepo (Wspólne repozytorium dla API, Web i Mobile).
🛠 Technologie
Backend: Node.js (Express/NestJS) + JavaScript
Frontend: React.js + Bootstap (dla szybkiego tworzenia widoków)
Mobile: React Native (Expo)
Baza Danych: MySQL
ORM: Prisma / TypeORM
✅ Lista Zadań (Roadmapa)
Odznaczaj [x] w edytorze tekstu w miarę postępów.
Faza 1: Baza Danych i Backend (Fundamenty)
Wymóg: Min. 30 tabel w bazie danych.
[ ] Konfiguracja repozytorium (Git init, struktura folderów: backend, frontend, mobile).
[ ] Baza Danych - zaprojektowanie diagramu ERD.
[ ] Migracja 1: Użytkownicy (tabele: users, roles, permissions, departments).
[ ] Migracja 2: Delegacje (tabele: business_trips, trip_types, destinations, transport_bookings, hotels).
[ ] Migracja 3: Słowniki (tabele: countries, cities, currencies, expense_categories - tutaj łatwo nabić liczbę tabel!).
[ ] Migracja 4: Rozliczenia (tabele: expenses, receipts, reports).
[ ] Backend API: Endpointy do logowania (Auth JWT).
[ ] Backend API: Podstawowy CRUD dla słowników (np. dodawanie miast/krajów przez Admina).
Faza 2: Frontend (Web) - Nabijanie Widoków
Wymóg: Min. 50 "interfejsów/widoków". Pamiętaj: każdy modal, popup czy krok formularza liczy się jako widok!
Panel Logowania:
[ ] Login Page
[ ] Register Page
[ ] Zapomniałem hasła
[ ] Reset hasła
Panel Administratora (CMS): Tu najłatwiej nabić widoki - proste tabele do edycji słowników.
[ ] Dashboard Administratora
[ ] Zarządzanie Użytkownikami (Lista + Edycja)
[ ] Zarządzanie Słownikami (Kraje, Miasta, Waluty, Hotele - każdy to osobny widok/tabela)
[ ] Podgląd logów systemowych
Panel Pracownika (Core):
[ ] Dashboard Pracownika (kafelki "Moje delegacje").
[ ] Kreator Delegacji (Wizard):
[ ] Krok 1: Cel i daty.
[ ] Krok 2: Wybór transportu.
[ ] Krok 3: Wybór hotelu.
[ ] Krok 4: Podsumowanie.
[ ] Lista moich wniosków.
[ ] Szczegóły wniosku (Read-only).
[ ] Moduł Rozliczeń:
[ ] Lista wydatków.
[ ] Modal: Dodaj paragon.
[ ] Podgląd rozliczenia.
Faza 3: Zaawansowane Funkcje (Dla oceny 5.0)
[ ] Generowanie PDF: Przycisk "Pobierz delegację jako PDF".
[ ] Szablony Word: Mechanizm podmieniania zmiennych w pliku .docx (Wymóg 19).
[ ] Aplikacja Mobilna:
[ ] Ekran logowania.
[ ] Lista wyjazdów (tylko podgląd).
[ ] Szybkie dodawanie zdjęcia paragonu (cyknięcie fotki).
📂 Struktura Bazy Danych (Ściąga)
Aby spełnić wymóg 30 tabel, trzymaj się tego podziału:
users
roles
permissions
users_roles_link
departments
business_trips
trip_statuses
trip_types
transports
accommodations
transport_types_dict (Słownik)
transport_companies_dict (Słownik: PKP, LOT...)
hotel_list_dict (Słownik)
countries_dict
cities_dict
currencies_dict
exchange_rates
expenses
expense_categories_dict
expense_reports
diet_rates_config (Stawki diet)
receipts (Linki do plików)
audit_logs (Logi systemowe)
notifications
notification_types
app_settings
report_templates (Szablony Word)
user_preferences
vat_rates_dict
error_logs
💡 Wskazówki "Studenckie"
Wygląd: Użyj gotowej biblioteki komponentów (MUI, AntD, Bootstrap). Nie stylowuj wszystkiego ręcznie w CSS, szkoda czasu. Ma być schludnie i spójnie (Wymóg 15).
Logika: Jeśli walidacja jest trudna, zrób ją po stronie frontend. Backend ma po prostu przyjmować dane.
Wspólny kod: Stwórz folder /shared, wrzuć tam definicje typów (interfejsy TS) i zaimportuj je w Back i Froncie. To wystarczy, by zaliczyć punkt o "współdzieleniu klas logiki".
Raporty: Do PDF użyj react-pdf (generowanie po stronie klienta jest łatwiejsze). Do Worda użyj docxtemplater na backendzie.
🚀 Uruchomienie (Dev)
Baza danych: docker compose up (Postgres)
Backend: cd backend && npm run start:dev
Frontend: cd frontend && npm start
Mobile: cd mobile && npx expo start


