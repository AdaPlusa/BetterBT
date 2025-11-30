Faza 1: Backend i Baza Danych (Wersja JS + Local DB)

Cel: Uruchomienie API i stworzenie 30 tabel w bazie danych w najprostszy możliwy sposób.

🛠 Przygotowanie Środowiska (Dzień 1)

Instalacja Node.js: Pobierz i zainstaluj (wersja LTS).

Instalacja Bazy Danych:

Pobierz PostgreSQL (z oficjalnej strony) i zainstaluj na Windows/Mac.

Podczas instalacji zapyta o hasło dla użytkownika postgres. Wpisz proste hasło (np. admin123) i zapamiętaj je!

Zainstaluj DBeaver lub pgAdmin (zazwyczaj instaluje się razem z Postgresem) - to program do podglądania bazy ("Excel dla bazy danych").

Tip instalacyjny DBeaver: Upewnij się, że opcja "Include Java" jest zaznaczona. Możesz też zaznaczyć "Associate SQL files" dla wygody.

Tworzenie Projektu i Git (BARDZO WAŻNE):

Stwórz główny folder dla całego projektu na pulpicie, np. o nazwie BetterBT.

Otwórz ten folder w VS Code (lub terminalu).

Uruchom Gita: Wpisz w terminalu: git init.

Dodaj Plany:

Stwórz plik README.md i wklej tam zawartość ogólnego planu projektu.

Stwórz plik PLAN_FAZA_1.md i wklej tam zawartość tego pliku, który teraz czytasz.

Zabezpieczenie (.gitignore):

Stwórz plik o nazwie .gitignore (z kropką na początku!).

Wpisz w nim jedną linię: node_modules.

Dlaczego? To sprawi, że Git nie będzie wysyłał tysięcy plików bibliotek do repozytorium.

Pierwszy zapis:

Wpisz: git add .

Wpisz: git commit -m "Start projektu: dodanie planów i struktury"

Start Backend:

Teraz stwórz w środku folder backend.

Wejdź do niego w terminalu: cd backend.

npm init -y (tworzy package.json).

npm install express cors dotenv @prisma/client (biblioteki podstawowe).

npm install -D nodemon prisma (narzędzia developerskie).

🗄 KROK 1: Połączenie z Bazą (Dzień 1-2)

Inicjalizacja Prisma:

Będąc w folderze backend, wpisz: npx prisma init

To stworzy folder prisma i plik .env.

Konfiguracja połączenia:

Wejdź w plik .env (w folderze backend).

Zmień linię DATABASE_URL na:
postgresql://postgres:admin123@localhost:5432/better_bt?schema=public
(Gdzie admin123 to Twoje hasło z instalacji, a better_bt to nazwa bazy).

Ważne: Dodaj plik .env do swojego .gitignore, jeśli go tam nie ma (dopisz nową linię .env w pliku .gitignore), żeby nie wysłać hasła do bazy na GitHuba!

Stworzenie pustej bazy:

Otwórz pgAdmin/DBeaver, połącz się i stwórz nową pustą bazę o nazwie better_bt.

📝 KROK 2: Projektowanie 30 Tabel (Dzień 2-4)

W pliku prisma/schema.prisma definiujesz tabele. To jest jedyne miejsce, gdzie musisz się "napracować" przy strukturze.
Dzięki Prisma, piszesz to prostym językiem, a nie SQL-em.

Taktyka na 30 tabel:
Stwórz dużo małych tabel słownikowych. Przykład kawałka pliku schema.prisma:

// To jest w pliku prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Tabela 1
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  roleId    Int
  role      Role     @relation(fields: [roleId], references: [id])
  trips     BusinessTrip[]
}

// Tabela 2
model Role {
  id    Int    @id @default(autoincrement())
  name  String // np. Admin, User
  users User[]
}

// Tabela 3 - Słownik
model Country {
  id    Int    @id @default(autoincrement())
  name  String
  code  String
  trips BusinessTrip[]
}

// ... i tak dalej do 30 tabel.




Zadanie: Przepisz nazwy tabel z poprzedniego planu do tego formatu.
Jak skończysz, wpisz w terminalu:
npx prisma db push
Efekt: Magia. Prisma połączy się z Twoją lokalną bazą i stworzy w niej te 30 tabel. Możesz to sprawdzić w DBeaverze.

🚀 KROK 3: Serwer API w JavaScript (Dzień 5)

Tworzysz plik index.js (lub server.js) w folderze backend.
Oto gotowiec na start ("Hello World" + Prisma):

// index.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json()); // Żeby serwer rozumiał JSON
app.use(cors()); // Żeby React mógł się łączyć

// Prosty endpoint testowy
app.get('/', (req, res) => {
  res.send('API Better BT działa!');
});

// Endpoint 1: Pobierz listę krajów (Test bazy)
app.get('/countries', async (req, res) => {
  try {
    const countries = await prisma.country.findMany();
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: 'Błąd bazy danych' });
  }
});

// Endpoint 2: Dodaj kraj (Test zapisu)
app.post('/countries', async (req, res) => {
  try {
    const { name, code } = req.body;
    const newCountry = await prisma.country.create({
      data: { name, code },
    });
    res.json(newCountry);
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się dodać kraju' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serwer śmiga na porcie ${PORT}`);
});




Uruchomienie: npx nodemon index.js

🔐 KROK 4: Logowanie (Najtrudniejsze) (Dzień 6-8)

Doinstaluj paczki: npm install bcryptjs jsonwebtoken.

Stwórz endpoint /login.

Logic:

Znajdź usera po emailu (prisma.user.findUnique).

Porównaj hasła (bcrypt.compareSync).

Jeśli ok -> wygeneruj token (jwt.sign).

Wyślij token do klienta.

🏁 KROK 5: Masowa produkcja endpointów (Dzień 9-10)

Masz już wzór na pobieranie (get) i dodawanie (post) z Kroku 3.
Teraz robisz "Kopiuj-Wklej" dla reszty słowników:

/cities

/currencies

/hotels

/transport-types

Cel: Mieć endpointy, z których React będzie mógł pobrać dane do list rozwijanych.

✅ Checklist Fazy 1 (JS Edition)

$$$$

 Zainstalowano Node.js i PostgreSQL (Lokalnie).

$$$$

 Stworzono główny folder projektu i zainicjowano Gita (git init).

$$$$

 Dodano pliki README.md i PLAN_FAZA_1.md do Gita.

$$$$

 Stworzono folder backend i npm init.

$$$$

 Połączono Prisma z bazą lokalną.

$$$$

 Zdefiniowano 30 modeli w schema.prisma.

$$$$

 Wykonano npx prisma db push (Tabele są w bazie!).

$$$$

 Plik index.js uruchamia serwer na porcie 3000.

$$$$

 Endpoint /login zwraca token JWT.

$$$$

 Endpointy CRUD dla 5-6 głównych słowników działają.