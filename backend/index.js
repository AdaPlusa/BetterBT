// index.js - Główny plik serwera Better BT (Wersja Kompletna Faza 1)

// 1. Importujemy biblioteki
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 2. Konfiguracja
const app = express();
const prisma = new PrismaClient();
const PORT = 3000;
const JWT_SECRET = "bardzo_tajny_klucz_studenta_123";

// Middleware
app.use(express.json());
app.use(cors());

// 3. Endpointy TESTOWE
app.get("/", (req, res) => {
  res.send("<h1>Serwer Better BT działa! 🚀</h1>");
});

// ==========================================
// SEKCJA 1: LOGOWANIE I REJESTRACJA (AUTH)
// ==========================================

// REJESTRACJA
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Użytkownik o takim emailu już istnieje!" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roleId: 2, // Domyślna rola: User
      },
    });
    res.json({ message: "Rejestracja udana!", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd rejestracji", details: error.message });
  }
});

// LOGOWANIE
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Nieprawidłowy email lub hasło" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Nieprawidłowy email lub hasło" });
    }
    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "Zalogowano!", token, user });
  } catch (error) {
    res.status(500).json({ error: "Błąd logowania" });
  }
});

// ==========================================
// SEKCJA 2: SŁOWNIKI (CRUD) - TO CZEGO SZUKAŁEŚ
// ==========================================

// --- 1. KRAJE (Countries) ---
app.get("/countries", async (req, res) => {
  const countries = await prisma.country.findMany();
  res.json(countries);
});

app.post("/countries", async (req, res) => {
  try {
    const { name, code } = req.body;
    const newCountry = await prisma.country.create({ data: { name, code } });
    res.json(newCountry);
  } catch (error) {
    res.status(500).json({ error: "Nie udało się dodać kraju" });
  }
});

// --- 2. MIASTA (Cities) ---
app.get("/cities", async (req, res) => {
  // include: { country: true } sprawia, że pobieramy też nazwę kraju, do którego należy miasto
  const cities = await prisma.city.findMany({ include: { country: true } });
  res.json(cities);
});

app.post("/cities", async (req, res) => {
  try {
    const { name, countryId } = req.body;
    // Ważne: countryId musi być liczbą (Int), więc używamy parseInt
    const newCity = await prisma.city.create({
      data: { name, countryId: parseInt(countryId) },
    });
    res.json(newCity);
  } catch (error) {
    res.status(500).json({
      error: "Błąd dodawania miasta. Sprawdź czy countryId istnieje!",
    });
  }
});

// --- 3. WALUTY (Currencies) ---
app.get("/currencies", async (req, res) => {
  const currencies = await prisma.currency.findMany();
  res.json(currencies);
});

app.post("/currencies", async (req, res) => {
  try {
    const { name, code } = req.body;
    const newCurrency = await prisma.currency.create({ data: { name, code } });
    res.json(newCurrency);
  } catch (error) {
    res.status(500).json({ error: "Błąd dodawania waluty" });
  }
});

// --- 4. HOTELE (Hotels) ---
app.get("/hotels", async (req, res) => {
  const hotels = await prisma.hotel.findMany({ include: { city: true } });
  res.json(hotels);
});

app.post("/hotels", async (req, res) => {
  try {
    const { name, cityId } = req.body;
    const newHotel = await prisma.hotel.create({
      data: { name, cityId: parseInt(cityId) },
    });
    res.json(newHotel);
  } catch (error) {
    res.status(500).json({ error: "Błąd dodawania hotelu" });
  }
});

// --- 5. TYPY TRANSPORTU (Transport Types) ---
app.get("/transport-types", async (req, res) => {
  const types = await prisma.transportType.findMany();
  res.json(types);
});

app.post("/transport-types", async (req, res) => {
  try {
    const { name } = req.body;
    const newType = await prisma.transportType.create({ data: { name } });
    res.json(newType);
  } catch (error) {
    res.status(500).json({ error: "Błąd dodawania typu transportu" });
  }
});

// ==========================================
// START SERWERA + AUTO-SEED
// ==========================================

app.listen(PORT, async () => {
  console.log(`
  🚀 Serwer uruchomiony na porcie ${PORT}
  Link: http://localhost:${PORT}
  `);

  // Automatyczne dodawanie ról, jeśli ich nie ma
  try {
    const rolesCount = await prisma.role.count();
    if (rolesCount === 0) {
      console.log("⚠️ Baza jest pusta. Dodaję domyślne role...");
      await prisma.role.createMany({
        data: [
          { name: "Admin" }, // ID 1
          { name: "User" }, // ID 2
          { name: "Manager" }, // ID 3
        ],
      });
      console.log("✅ Role dodane!");
    }
  } catch (e) {
    console.log("Info: Baza danych gotowa.");
  }
});
