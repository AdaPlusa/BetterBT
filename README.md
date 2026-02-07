# Better BT - Business Travel System

Profesjonalny system do zarządzania delegacjami służbowymi (Business Travel), integrujący procesy planowania, akceptacji, rezerwacji oraz rozliczania kosztów.

System składa się z trzech głównych modułów:
1.  **Backend** - API (Node.js/Express)
2.  **Frontend** - Panel webowy dla pracowników i menedżerów (React)
3.  **Mobile** - Aplikacja mobilna dla pracowników w terenie (React Native / Expo)

---

## 🚀 Technologie (Tech Stack)

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Baza Danych**: PostgreSQL
-   **ORM**: Prisma
-   **Autentykacja**: JWT (JSON Web Tokens)

### Frontend (Web)
-   **Framework**: React (Vite)
-   **Styling**: Bootstrap 5 + Custom CSS / Bootswatch
-   **Routing**: React Router DOM (v6)

### Mobile
-   **Framework**: React Native (Expo)
-   **UI Library**: React Native Paper
-   **Navigation**: React Navigation

---

## 🛠 Instalacja i Uruchomienie

### Wymagania wstępne
-   Node.js (v18+)
-   PostgreSQL (lokalnie lub docker)
-   npm / yarn

### 1. Backend

1.  Przejdź do katalogu `backend`:
    ```bash
    cd backend
    ```
2.  Zainstaluj zależności:
    ```bash
    npm install
    ```
3.  Skonfiguruj plik `.env` (baza danych).
4.  Uruchom migracje bazy danych:
    ```bash
    npx prisma migrate dev
    ```
5.  Uruchom serwer developerski:
    ```bash
    npm start
    # Serwer startuje na porcie 3000
    ```

### 2. Frontend

1.  Przejdź do katalogu `frontend`:
    ```bash
    cd frontend
    ```
2.  Zainstaluj zależności:
    ```bash
    npm install
    ```
3.  Uruchom aplikację:
    ```bash
    npm run dev
    # Aplikacja dostępna pod adresem http://localhost:5173
    ```

### 3. Mobile

1.  Przejdź do katalogu `mobile`:
    ```bash
    cd mobile
    ```
2.  Zainstaluj zależności:
    ```bash
    npm install
    ```
3.  Uruchom Metro Bundler:
    ```bash
    npx expo start
    ```
4.  Zeskanuj kod QR aplikacją Expo Go (Android/iOS) lub uruchom emulator.

---

## 📂 Struktura Projektu

-   `/backend` - Logika serwerowa, API, połączenie z bazą danych.
-   `/frontend` - Aplikacja przeglądarkowa (Panel Użytkownika, Panel Menedżera, Panel Admina).
-   `/mobile` - Aplikacja mobilna (Podgląd wyjazdów, Dodawanie wydatków, Przesyłanie paragonów).

---

## 🔒 Bezpieczeństwo

Aplikacja wykorzystuje tokeny JWT do autoryzacji zapytań.
Hasła użytkowników są hashowane przy użyciu `bcrypt`.
Role systemowe (User, Manager, Admin) sterują dostępem do poszczególnych zasobów API.

---

## 📄 Licencja

Projekt stworzony na potrzeby edukacyjne/zaliczeniowe. Wszelkie prawa zastrzeżone.
