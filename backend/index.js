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
// Middleware
app.use(express.json({ limit: "50mb" }));
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
    const { email, password, firstName, lastName, roleId } = req.body;
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
        roleId: roleId ? parseInt(roleId) : 2, // Domyślna rola: User (2)
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
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { role: true }
    });
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

// UŻYTKOWNICY (Users)
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
        include: { role: true, department: true }
    });
    const safeUsers = users.map(u => {
        const { password, ...rest } = u;
        return rest;
    });
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: "Błąd pobierania użytkowników" });
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
    const { name, code, continent, perDiemRate } = req.body;
    const newCountry = await prisma.country.create({ 
      data: { 
          name, 
          code, 
          continent,
          perDiemRate: perDiemRate ? parseFloat(perDiemRate) : 45
      } 
    });
    res.json(newCountry);
  } catch (error) {
    res.status(500).json({ error: "Nie udało się dodać kraju" });
  }
});

app.put("/countries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, continent, perDiemRate } = req.body;
    const updatedCountry = await prisma.country.update({
      where: { id: parseInt(id) },
      data: { 
          name, 
          code, 
          continent,
          perDiemRate: perDiemRate ? parseFloat(perDiemRate) : undefined
      },
    });
    res.json(updatedCountry);
  } catch (error) {
    res.status(500).json({ error: "Nie udało się zaktualizować kraju" });
  }
});

app.delete("/countries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.country.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Kraj usunięty" });
  } catch (error) {
    // Prisma rzuci błąd np. P2003 jeśli są powiązane rekordy (Foreign Key)
    res.status(500).json({
      error: "Nie można usunąć kraju. Prawdopodobnie są do niego przypisane miasta.",
    });
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
    return res.status(500).json({ error: "Błąd dodawania miasta" });
  }
});

app.get("/cities/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const city = await prisma.city.findUnique({
            where: { id: parseInt(id) },
            include: { country: true }
        });
        if (!city) return res.status(404).json({ error: "Miasto nie znalezione" });
        res.json(city);
    } catch (error) {
        res.status(500).json({ error: "Błąd pobierania miasta" });
    }
});

app.put("/cities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, countryId } = req.body;
    const updatedCity = await prisma.city.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        countryId: parseInt(countryId) 
      },
    });
    res.json(updatedCity);
  } catch (error) {
    res.status(500).json({ error: "Nie udało się zaktualizować miasta" });
  }
});

app.delete("/cities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.city.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Miasto usunięte" });
  } catch (error) {
    res.status(500).json({
      error: "Nie można usunąć miasta. Prawdopodobnie są do niego przypisane hotele lub delegacje.",
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
  const { cityId } = req.query;
  const where = cityId ? { cityId: parseInt(cityId) } : {};
  const hotels = await prisma.hotel.findMany({ 
      where,
      include: { city: true } 
  });
  res.json(hotels);
});

app.post("/hotels", async (req, res) => {
  try {
    const { name, cityId, imageUrl } = req.body;
    const newHotel = await prisma.hotel.create({
      data: { 
          name, 
          cityId: parseInt(cityId),
          imageUrl: imageUrl || null
      },
    });
    res.json(newHotel);
  } catch (error) {
    res.status(500).json({ error: "Błąd dodawania hotelu" });
  }
});

app.put("/hotels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cityId, imageUrl } = req.body;
    const updatedHotel = await prisma.hotel.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        cityId: parseInt(cityId),
        imageUrl: imageUrl || null
      },
    });
    res.json(updatedHotel);
  } catch (error) {
    res.status(500).json({ error: "Nie udało się zaktualizować hotelu" });
  }
});

app.delete("/hotels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.hotel.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Hotel usunięty" });
  } catch (error) {
    res.status(500).json({
      error: "Nie można usunąć hotelu. Prawdopodobnie jest używany w delegacjach.",
    });
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

app.delete("/transport-types/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.transportType.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Typ transportu usunięty" });
  } catch (error) {
    res.status(500).json({ error: "Nie można usunąć typu. Może być używany." });
  }
});

// --- 5a. DOSTAWCY TRANSPORTU (Transport Providers) ---
app.get("/transport-providers", async (req, res) => {
  const providers = await prisma.transportProvider.findMany({
      include: { type: true }
  });
  res.json(providers);
});

app.post("/transport-providers", async (req, res) => {
  try {
    const { name, typeId } = req.body;
    const newProvider = await prisma.transportProvider.create({ 
        data: { 
            name,
            typeId: typeId ? parseInt(typeId) : null
        } 
    });
    res.json(newProvider);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd dodawania dostawcy transportu" });
  }
});

app.put("/transport-providers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, typeId } = req.body;
    const updatedProvider = await prisma.transportProvider.update({
      where: { id: parseInt(id) },
      data: { 
        name,
        typeId: typeId ? parseInt(typeId) : null
      }
    });
    res.json(updatedProvider);
  } catch (error) {
    res.status(500).json({ error: "Błąd edycji dostawcy" });
  }
});

app.delete("/transport-providers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.transportProvider.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Dostawca usunięty" });
  } catch (error) {
    res.status(500).json({ error: "Nie można usunąć dostawcy. Może być używany." });
  }
});

// --- 6. TRASY TRANSPORTOWE (Transport Routes) ---
app.get("/transport-routes", async (req, res) => {
  try {
    const routes = await prisma.transportRoute.findMany({
      include: {
        originCity: { include: { country: true } },
        destinationCity: { include: { country: true } },
        transportType: true,
        provider: true
      }
    });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: "Błąd pobierania tras" });
  }
});

app.post("/transport-routes", async (req, res) => {
  try {
    const { originCityId, destinationCityId, transportTypeId, providerId, price, currency } = req.body;
    
    // Walidacja: origin != destination
    if (originCityId === destinationCityId) {
      return res.status(400).json({ error: "Miasto początkowe i końcowe muszą być różne" });
    }

    const newRoute = await prisma.transportRoute.create({
      data: {
        originCityId: parseInt(originCityId),
        destinationCityId: parseInt(destinationCityId),
        transportTypeId: parseInt(transportTypeId),
        providerId: parseInt(providerId),
        price: parseFloat(price),
        currency: currency || "PLN"
      }
    });
    res.json(newRoute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd dodawania trasy", details: error.message });
  }
});

// --- 7. USERS \/ ROLES ---

app.patch("/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { roleId: parseInt(roleId) }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Błąd zmiany roli" });
  }
});

app.get("/roles", async (req, res) => {
  const roles = await prisma.role.findMany();
  res.json(roles);
});

// --- 8. DELEGACJE (Trips) ---
app.post("/trips", async (req, res) => {
  try {
    const { userId, destinationId, startDate, endDate, purpose, transportType, transportCost, transportProviderId, transportTypeId, hotelId, hotelCheckIn, hotelCheckOut, isInternational, estimatedCost } = req.body;

    // Ustal typ delegacji (1=Krajowa, 2=Zagraniczna)
    const tripTypeId = isInternational ? 2 : 1;

    // Prosta walidacja 
    const newTrip = await prisma.businessTrip.create({
      data: {
        userId: parseInt(userId),
        destinationId: parseInt(destinationId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        purpose: purpose,
        statusId: 1, // Domyślnie: Nowa
        typeId: tripTypeId,
        
        // Dodajemy transport TYLKO jeśli wybrano publiczny i mamy ID
        ...(transportType === 'public' && transportProviderId && transportTypeId && {
            transports: {
                create: {
                    typeId: parseInt(transportTypeId), 
                    providerId: parseInt(transportProviderId), 
                    cost: parseFloat(transportCost || 0)
                }
            }
        }),

    // Opcjonalnie dodajemy hotel jeśli wybrano
        ...(hotelId && {
            accommodations: {
                create: {
                    hotelId: parseInt(hotelId),
                    checkIn: new Date(hotelCheckIn || startDate),
                    checkOut: new Date(hotelCheckOut || endDate)
                }
            }
        }),
        // Nowe pole: Szacowany Koszt
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null
      }
    });

    res.json(newTrip);
  } catch (error) {
    console.error("Błąd tworzenia delegacji:", error);
    res.status(500).json({ error: "Błąd tworzenia delegacji", details: error.message });
  }
});

// GET /available-routes - Dla Wizarda (Krok 2)
app.get("/available-routes", async (req, res) => {
    try {
        const { fromCityId, toCityId } = req.query;
        // Allow querying by just one parameter for advanced filtering
        if (!fromCityId && !toCityId) {
            return res.status(400).json({ error: "Podaj fromCityId lub toCityId" });
        }

        const where = {};
        if (fromCityId) where.originCityId = parseInt(fromCityId);
        if (toCityId) where.destinationCityId = parseInt(toCityId);

        const routes = await prisma.transportRoute.findMany({
            where,
            include: {
                transportType: true,
                provider: true
            }
        });
        res.json(routes);
    } catch (error) {
        res.status(500).json({ error: "Błąd szukania tras" });
    }
});

// --- MANAGER ENDPOINTS ---

// GET /manager/pending-trips - Wnioski do akceptacji (statusId=1, inne niż moje)
app.get("/manager/pending-trips", async (req, res) => {
    try {
        const { userId } = req.query; // ID managera, żeby nie widział swoich (opcjonalne)
        const where = { statusId: 1 };
        if (userId) {
            where.userId = { not: parseInt(userId) };
        }

        const trips = await prisma.businessTrip.findMany({
            where,
            include: { user: true, destination: true, status: true }
        });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: "Błąd pobierania wniosków" });
    }
});

// PATCH /manager/approve/:id
app.patch("/manager/approve/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await prisma.businessTrip.update({
            where: { id: parseInt(id) },
            data: { statusId: 2 } // 2 = Zatwierdzona (w seedzie statusów trzeba to sprawdzić, ale zakładamy 2)
        });
        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: "Błąd zatwierdzania" });
    }
});

// PATCH /manager/reject/:id
app.patch("/manager/reject/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body; // Pobierz powód z body
        const trip = await prisma.businessTrip.update({
            where: { id: parseInt(id) },
            data: { 
                statusId: 3, // 3 = Odrzucona
                rejectionReason: reason || "Brak powodu"
            } 
        });
        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: "Błąd odrzucania" });
    }
});


app.get("/trips", async (req, res) => {
    const { userId } = req.query;
    try {
        const where = userId ? { userId: parseInt(userId) } : {};
        const trips = await prisma.businessTrip.findMany({
            where,
            include: { destination: true, status: true, user: true }
        });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: "Błąd pobierania delegacji" });
    }
});

// GET /trips/:id - Szczegóły delegacji
app.get("/trips/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await prisma.businessTrip.findUnique({
            where: { id: parseInt(id) },
            include: {
                destination: true,
                status: true,
                user: true,
                transports: { include: { type: true, provider: true } },
                accommodations: { include: { hotel: true } }
            }
        });
        if (!trip) return res.status(404).json({ error: "Trip not found" });
        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: "Błąd pobierania szczegółów" });
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

    // 2. TripStatus
    if ((await prisma.tripStatus.count()) === 0) {
      await prisma.tripStatus.createMany({
        data: [{ name: "Nowa" }, { name: "Zatwierdzona" }, { name: "Odrzucona" }, { name: "Rozliczona" }],
      });
      console.log("✅ TripStatuses dodane");
    }

    // 3. TripType
    if ((await prisma.tripType.count()) === 0) {
      await prisma.tripType.createMany({
        data: [{ name: "Krajowa" }, { name: "Zagraniczna" }, { name: "Szkoleniowa" }],
      });
      console.log("✅ TripTypes dodane");
    }

    // 4. TransportType (Słownik transportu dla bazy)
    if ((await prisma.transportType.count()) === 0) {
      await prisma.transportType.createMany({
        data: [{ name: "Pociąg" }, { name: "Samolot" }, { name: "Auto" }],
      });
      console.log("✅ TransportTypes dodane");
    }
    
    // 5. TransportProvider (Dostawcy)
    if ((await prisma.transportProvider.count()) === 0) {
        await prisma.transportProvider.createMany({
          data: [{ name: "PKP" }, { name: "LOT" }, { name: "Uber" }],
        });
        console.log("✅ TransportProviders dodane");
      }
  } catch (e) {
    console.log("Info: Baza danych gotowa.");
  }
});
