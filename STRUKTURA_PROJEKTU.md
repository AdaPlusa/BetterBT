# 📂 STRUKTURA PROJEKTU - BETTER BT

Poniżej znajduje się mapa Twojego projektu. Każdy plik oznaczony jest ikoną, która mówi, czy musisz go znać na wylot, czy możesz go zignorować.

---

## 🗝️ Legenda (Co oznaczają ikony?)

| Ikona | Typ Pliku | Opis dla Studenta |
| :---: | :--- | :--- |
| ✍️ | **KOD WŁASNY** | **Najważniejsze!** To jest Twoja praca inżynierska. Kod, który napisałaś ręcznie (logika, widoki, style). Musisz to rozumieć w 100%. |
| ⚙️ | **KONFIGURACJA** | Pliki ustawień. Edytowane rzadko (zazwyczaj raz na początku). Warto wiedzieć do czego służą, ale nie trzeba ich znać na pamięć. |
| 🤖 | **SYSTEMOWE** | Pliki wygenerowane automatycznie przez narzędzia (npm, vite, prisma). **Nie edytuj ich ręcznie**. Traktuj je jak "czarną skrzynkę". |

---

## 🏗️ Główne Foldery

### 1. 🖥️ Backend (`/backend`)
*Serce systemu. Tutaj znajduje się logika biznesowa, połączenie z bazą danych i API.*

- 🤖 **`node_modules/`** - Biblioteki pobrane z internetu (np. Express, Prisma). Nie ruszamy tego folderu (jest tworzony przez `npm install`).
- 🤖 **`prisma/`**
    - ⚙️ **`schema.prisma`** - **Ważne!** Definicja bazy danych. Tutaj projektujesz tabele (User, Trip) i relacje między nimi.
    - 🤖 **`migrations/`** - Historia zmian w bazie danych generowana przez Prismę.
- ⚙️ **`.env`** - Zmienne środowiskowe (hasła do bazy, sekretne klucze JWT). Nie wrzucamy tego na GitHuba!
- ⚙️ **`package.json`** - "Dowód osobisty" projektu. Lista bibliotek, których używasz (np. "express", "cors") i skrypty startowe.
- 🤖 **`package-lock.json`** - Dokładne wersje bibliotek. Gwarantuje, że projekt zadziała tak samo na każdym komputerze.
- ✍️ **`index.js`** - **Główny plik serwera**. Tutaj startuje aplikacja, łączymy się z bazą i definiujemy endpointy (np. logowanie, pobieranie delegacji).
- ✍️ **`add_statuses.js`** / **`seed_*.js`** - Skrypty pomocnicze do wypełnienia bazy danych przykładowymi danymi (Seeding).

### 2. 🌐 Frontend (`/frontend`)
*Aplikacja przeglądarkowa dla Administratora i Pracownika (React + Vite).*

- 🤖 **`node_modules/`** - Biblioteki frontendu (React, Bootstrap).
- 🤖 **`dist/`** - (Może nie istnieć przed zbudowaniem) Wersja produkcyjna aplikacji, gotowa do wrzucenia na serwer.
- ⚙️ **`vite.config.js`** - Konfiguracja narzędzia Vite (szybki serwer deweloperski).
- ⚙️ **`index.html`** - Główny plik HTML, do którego "montuje się" React (szukaj `<div id="root">`).
- 📂 **`src/`** (Source Code - Kod Źródłowy)
    - ✍️ **`main.jsx`** - Punkt startowy Reacta. Importuje style globalne i renderuje komponent `<App />`.
    - ✍️ **`App.jsx`** - Główny komponent zawierający **Routing** (mapę stron: /login -> LoginPage, /dashboard -> DashboardPage).
    - ✍️ **`App.css`** / **`index.css`** - Globalne style CSS.
    - 📂 **`components/`** - Klocki LEGO (wielokrotnego użytku), np. Navbar, Layout strony.
        - ✍️ **`ProtectedLayout.jsx`** - Komponent-strażnik. Sprawdza, czy użytkownik jest zalogowany przed wyświetleniem treści.
    - 📂 **`pages/`** - Widoki (ekrany) aplikacji.
        - 📂 **`auth/`** - Logowanie i Rejestracja (`LoginPage`, `RegisterPage`).
        - 📂 **`user/`** - Panel Pracownika (`Dashboard`, `MyTrips`, `Settlement`).
        - 📂 **`manager/`** - Panel Managera (Zatwierdzanie, Rozliczenia).
        - 📂 **`wizard/`** - Kreator wniosku krok po kroku.
        - 📂 **`dictionaries/`** - Słowniki (Kraje, Miasta, Hotele).
    - 📂 **`services/`** - Logika komunikacji z Backendem.
        - ✍️ **`api.js`** - Konfiguracja **Axios**. Tutaj jest "Interceptor", który automatycznie dokleja Token JWT do każdego zapytania.

### 3. 📱 Mobile (`/mobile`)
*Aplikacja mobilna dla Pracownika w terenie (React Native + Expo).*

- 🤖 **`.expo/`** - Pliki tymczasowe Expo.
- ⚙️ **`app.json`** - Konfiguracja aplikacji mobilnej (nazwa, ikona, wersja, uprawnienia kamery).
- ✍️ **`App.js`** - Punkt startowy aplikacji mobilnej. Zawiera **Nawigację** (Stack Navigator: Login -> Home).
- 📂 **`screens/`** - Ekrany aplikacji mobilnej (analogicznie do `pages` we frontendzie).
    - ✍️ **`LoginScreen.js`** - Logowanie na telefonie.
    - ✍️ **`HomeScreen.js`** - Widok główny (lista opcji).
    - ✍️ **`TripDetailsScreen.js`** - Szczegóły delegacji.
    - ✍️ **`ServerSettingsScreen.js`** - Ekran do wpisania IP serwera (przydatne przy testowaniu na fizycznym telefonie).
    - ✍️ **`TicketScreen.js`** - Widok biletu (np. generowanie kodu QR).

---

## ❓ Częste Pytania (FAQ)

### Pytanie 1: Czym się różni `package.json` od `package-lock.json`?
**Prosta Odpowiedź:**
*   `package.json` to **Lista Życzeń** (np. "Chcę Reacta w wersji co najmniej 18").
*   `package-lock.json` to **Paragon** (np. "Zainstalowano Reacta w wersji 18.2.0 i pobrano go z tego konkretnego serwera"). Gwarantuje, że wszyscy w zespole mają identyczne pliki.

### Pytanie 2: Co to jest `node_modules` i dlaczego zajmuje tyle miejsca?
To folder, w którym npm trzyma wszystkie pobrane biblioteki (oraz biblioteki, których używają te biblioteki...). Jest ogromny, dlatego **nigdy nie wysyłamy go mailem ani na GitHuba**. Można go zawsze odtworzyć wpisując komendę `npm install`.

### Pytanie 3: Gdzie jest kod, który łączy się z bazą danych?
W folderze **Backend**, głównie w pliku `index.js` (używając obiektu `prisma`). Frontend i Mobile **nie łączą się** z bazą bezpośrednio – one tylko proszą Backend o dane (przez API).

---
*Wygenerowano przez AI Assistant (Antigravity).*
