# DOKUMENTACJA TECHNICZNA - PROJEKT BETTER BT (System Delegacji)

Dokumentacja techniczna i audyt projektu inżynierskiego.

---

## 1. Stack Technologiczny (Co i Dlaczego?)

### Backend (Node.js)

| Technologia | Do czego służy? | Dlaczego to wybraliśmy? (Uzasadnienie) |
| :--- | :--- | :--- |
| **Node.js** | Środowisko uruchomieniowe serwera. | Umożliwia pisanie backendu w JavaScript (tym samym języku co frontend), co ułatwia development (full-stack JS). Jest wydajny dzięki asynchroniczności (non-blocking I/O). |
| **Express** | Framework webowy dla Node.js. | Standard rynkowy. Udostępnia proste metody do tworzenia API (routing, obsługa żądań HTTP), co przyspiesza pisanie kodu w porównaniu do "czystego" Node.js. |
| **Prisma** | ORM (Object-Relational Mapping). | Ułatwia komunikację z bazą danych SQL. Zamiast pisać trudne zapytania SQL, używamy metod obiektowych (np. `prisma.user.findMany()`). Zapewnia bezpieczeństwo typów i automatyczne migracje. |
| **PostgreSQL** | Relacyjna baza danych. | Wybór podyktowany wymaganiami inżynierskimi. Oferuje solidne wsparcie dla relacji (klucze obce) i transakcyjności, co jest kluczowe w systemach księgowych (rozliczenia delegacji). |
| **Bcryptjs** | Biblioteka kryptograficzna. | Do hashowania haseł użytkowników. Jest standardem bezpieczeństwa - hashowanie jest jednostronne, co chroni hasła nawet przy wycieku bazy danych. |
| **JsonWebToken (JWT)** | Obsługa tokenów autoryzacyjnych. | Bezzapieczeniowy (stateless) mechanizm logowania. Pozwala zidentyfikować użytkownika bez ciągłego odpytywania bazy danych o sesję. |
| **Cors** | Middleware (Oprogramowanie pośrednie). | Pozwala na komunikację między Frontendem (domyślnie port 5173/3001) a Backendem (port 3000), które działają na innych portach (Origin). |
| **Dotenv** | Zarządzanie zmiennymi środowiskowymi. | Pozwala ukryć wrażliwe dane (hasła do bazy, sekrety JWT) w pliku `.env`, który nie trafia do repozytorium (GitHub). |

### Frontend (React)

| Technologia | Do czego służy? | Dlaczego to wybraliśmy? (Uzasadnienie) |
| :--- | :--- | :--- |
| **React** | Biblioteka UI. | Komponentowe podejście ułatwia budowanie interfejsu. Pozwala na tworzenie SPA (Single Page Application), co daje wrażenie "płynności" aplikacji (brak przeładowań strony). |
| **Vite** | Narzędzie do budowania (Build Tool). | Następca Webpacka. Jest ekstremalnie szybki, co przyspiesza pracę deweloperską (Hot Module Replacement). |
| **Axios** | Klient HTTP. | Do komunikacji z Backendem. Lepszy od `fetch` ponieważ automatycznie obsługuje JSON i pozwala na konfigurację interceptorów (automatyczne doklejanie tokena). |
| **Bootstrap** | Biblioteka CSS. | Szybkie stylowanie. Dzięki gotowym klasom (np. `btn btn-primary`) nie musimy pisać setek linii CSS, co oszczędza czas. |
| **React Router** | Routing po stronie klienta. | Pozwala na nawigację między "stronami" bez odświeżania przeglądarki, co jest kluczowe dla SPA. Obsługuje też chronione trasy (Protected Routes). |

---

## 2. Architektura Systemu i Przepływ Danych

System działa w architekturze **Klient-Serwer** typu SPA (Single Page Application).

### Schemat Komunikacji

```mermaid
graph LR
    User((Użytkownik)) -- klika w przeglądarce --> React[Frontend (React)]
    React -- JSON (Axios) --> Express[Backend API (Express)]
    Express -- Prisma Query --> DB[(Baza Danych PostgreSQL)]
    DB -- Wynik SQL --> Express
    Express -- JSON --> React
    React -- Aktualizacja DOM --> User
```

### Mechanizm Autoryzacji (JWT Flow)

1.  **Logowanie**:
    *   Użytkownik wpisuje email/hasło.
    *   Backend sprawdza hash hasła (Bcrypt).
    *   Jeśli poprawne -> Backend generuje **Token JWT** (podpisany cyfrowo) i odsyła go do Frontendu.
2.  **Przechowywanie**:
    *   Frontend (React) odbiera token i zapisuje go w `localStorage` przeglądarki.
3.  **Użycie (Interceptor)**:
    *   Zanim Axios wyśle *jakiekolwiek* zapytanie do API, "Interceptor" (w pliku `api.js`) przechwytuje je.
    *   Sprawdza czy w `localStorage` jest token.
    *   Jeśli tak -> Dokleja nagłówek: `Authorization: Bearer <TWOJ_TOKEN>`.
4.  **Weryfikacja**:
    *   Backend powinien (patrz sekcja Audyt!) odczytać ten nagłówek i zweryfikować czy token jest ważny, zanim pozwoli na dostęp do danych.

---

## 3. Weryfikacja Wymagań (Audyt Inżynierski)

Stan na dzień audytu (backend/index.js).

| Wymaganie | Status | Komentarz Audytora |
| :--- | :---: | :--- |
| **Relacyjna Baza Danych (3NF)** | ✅ **TAK** | Schemat Prisma jest poprawny. Mamy tabele słownikowe (Kraje, Waluty) połączone relacjami One-to-Many z encjami głównymi. Tabela łącząca `RolePermission` to poprawna implementacja Many-to-Many. |
| **CRUD** | ✅ **TAK** | W `index.js` zaimplementowano pełne operacje Create, Read, Update, Delete dla słowników (Kraje, Miasta, Hotele). |
| **Separacja Warstw** | ✅ **TAK** | Frontend jest oddzielną aplikacją (SPA). Logika biznesowa jest na Backedzie, a prezentacja na Frontendzie. Komunikacja tylko przez JSON. |
| **Bezpieczeństwo (Hasła)** | ✅ **TAK** | Hasła są hashowane przy rejestracji (`bcrypt.hash`) i poprawnie porównywane przy logowaniu (`bcrypt.compare`). |
| **Bezpieczeństwo (Endpointy)** | ⚠️ **UWAGA** | **KRYTYCZNE BRAKI**. Token jest generowany i wysyłany przez Frontend, ale Backend w pliku `index.js` **nie weryfikuje** go w większości endpointów (brak middleware `verifyToken` na trasach `/countries`, `/trips` itp.). Każdy kto zna adres API może pobrać dane bez logowania! (Do poprawy). |
| **Logika Biznesowa** | ✅ **TAK** | Złożona logika zmiany statusów delegacji (Nowa -> Zatwierdzona -> Rozliczana). Obsługa uploadu plików Paragonów. |

---

## 4. Ściąga na Obronę (Pytania i Odpowiedzi)

Przygotuj się na te pytania. Nie ucz się na pamięć, zrozum ideę.

### Pytanie 1: "Dlaczego użyliście tutaj `async/await` a nie `.then()`?"
**Twoja Odpowiedź:**
"Dla czytelności kodu, Panie Profesorze. `Async/await` to tzw. *syntactic sugar* (lukier składniowy) dla Promisów. Pozwala pisać kod asynchroniczny (jak zapytanie do bazy) tak, jakby był synchroniczny (linijka po linijce), co ułatwia zarządzanie błędami w bloku `try/catch` i unikanie *callback hell*."

### Pytanie 2: "Co robi `prisma.include` w zapytaniach?"
**Twoja Odpowiedź:**
"To odpowiednik instrukcji `JOIN` w SQL. Prisma domyślnie pobiera dane tylko z jednej tabeli. Używając `include`, mówimy ORMowi, żeby pobrał też powiązane rekordy (np. Miasto wraz z nazwą Kraju) w jednym zapytaniu, co jest wydajniejsze niż robienie dwóch osobnych zapytań."

### Pytanie 3: "W jaki sposób rozwiązaliście problem CORS?"
**Twoja Odpowiedź:**
"Zainstalowaliśmy bibliotekę `cors` na backendzie. Przeglądarki domyślnie blokują zapytania między różnymi portami (Frontend 5173, Backend 3000) ze względów bezpieczeństwa. Middleware `cors()` dodaje odpowiednie nagłówki HTTP (np. `Access-Control-Allow-Origin`), informując przeglądarkę, że frontend ma prawo pytać ten serwer o dane."

### Pytanie 4: "Dlaczego `useEffect` wykonuje się dwa razy?" (Częste pytanie o Reacta 18)
**Twoja Odpowiedź:**
"To cecha trybu deweloperskiego (`StrictMode`) w React 18. React celowo montuje komponent dwa razy, żeby wykryć błędy w zarządzaniu efektami ubocznymi (np. nieczyszczenie listenerów). Na produkcji dzieje się to tylko raz."

---

## 5. Code Cleanup (Lista Sprzątania - TODO)

Nie usuwaj tego teraz, ale przed oddaniem projektu warto to wyczyścić.

### Backend (`index.js`)
*   [ ] **Wdrożenie Middleware Auth**: To najważniejsze. Należy napisać funkcję `verifyToken` i dodać ją do endpointów, np. `app.get("/trips", verifyToken, ...)` żeby naprawić lukę bezpieczeństwa.
*   [ ] **Zakomentowany kod**: Linie 704-709 w `index.js` (filtrowanie po userId) są zakomentowane. Należy to odkomentować lub usunąć.
*   [ ] **Hardcodowane sekrety**: Klucz `JWT_SECRET` jest wpisany "na sztywno" w kodzie (`bardzo_tajny_klucz...`). Powinien być pobierany z `process.env.JWT_SECRET`.
*   [ ] **Monolityczny plik**: `index.js` ma prawie 1000 linii. Warto przenieść definicje modeli (Auth, Trips, Dictionaries) do osobnych plików `routes/`.
*   [ ] **Obsługa błędów**: Wiele `catch(error)` tylko wypisuje błąd w konsoli. Warto ustandaryzować komunikaty błędów dla klienta.

### Frontend
*   [ ] **Console.log**: Usunąć wszystkie `console.log` z kodu produkcyjnego (zostawiają bałagan w konsoli przeglądarki).
*   [ ] **Nieużywane importy**: Przejrzeć pliki i usunąć szare (nieużywane) importy na górze plików.

---
*Wygenerowano przez AI Assistant (Antigravity).*
