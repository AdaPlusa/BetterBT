
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const app = express();
const prisma = new PrismaClient();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secure-secret-key";


app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => res.send("<h1>Serwer Better BT działa! 🚀</h1>"));



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
        roleId: roleId ? parseInt(roleId) : 2, // Default role: User
      },
    });
    res.json({ message: "Rejestracja udana!", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Błąd rejestracji", details: error.message });
  }
});


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


app.get("/auth/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "Brak tokenu" });
        
        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Błędny token" });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) return res.status(404).json({ error: "Użytkownik nie istnieje" });

        // Nie zwracamy hasła
        const { password, ...userData } = user;
        res.json(userData);
    } catch (e) {
        res.status(401).json({ error: "Nieautoryzowany" });
    }
});


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

// --- API: Dictionaries ---


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

app.delete("/transport-routes/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.transportRoute.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Trasa usunięta" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Błąd usuwania trasy" });
    }
});



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


app.post("/trips", async (req, res) => {
  try {
    const { userId, destinationId, startDate, endDate, purpose, transportType, transportCost, transportProviderId, transportTypeId, hotelId, hotelCheckIn, hotelCheckOut, isInternational, estimatedCost } = req.body;

    // 1=Domestic, 2=International
    const tripTypeId = isInternational ? 2 : 1;

    // Prosta walidacja 
    const newTrip = await prisma.businessTrip.create({
      data: {
        userId: parseInt(userId),
        destinationId: parseInt(destinationId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        purpose: purpose,
        statusId: 1, // Default: New
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

// POST /trips/:id/settlement - User wysyła rozliczenie
app.post("/trips/:id/settlement", async (req, res) => {
    try {
        const { id } = req.params;
        const { items, totalAmount } = req.body; 

        // 1. Create/Update Expense Report
        // Sprawdzamy czy już jest (np. przy poprawce)
        const existingReport = await prisma.expenseReport.findUnique({ where: { tripId: parseInt(id) } });
        
        if (existingReport) {
            // Update logic (simplified: delete items and recreate)
            await prisma.expenseItem.deleteMany({ where: { reportId: existingReport.id } });
            
            // Re-create items logic is complex with async files, so we do it step by step
            await prisma.expenseReport.update({
                where: { id: existingReport.id },
                data: {
                    totalAmount: totalAmount,
                    status: 'SUBMITTED' // Reset status if re-submitted
                }
            });

            // Process items one by one to handle async file saves
            for (const item of items) {
                let receiptId = null;

                if (item.fileData) {
                    try {
                        // Ensure uploads dir exists
                        if (!fs.existsSync('uploads')) {
                            fs.mkdirSync('uploads');
                        }

                        const matches = item.fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                        if (matches && matches.length === 3) {
                            const type = matches[1];
                            const buffer = Buffer.from(matches[2], 'base64');
                            const extension = type.split('/')[1] || 'bin';
                            const fileName = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
                            
                            fs.writeFileSync(`uploads/${fileName}`, buffer);

                            const receipt = await prisma.receipt.create({
                                data: {
                                    fileName: fileName,
                                    fileUrl: `/uploads/${fileName}`
                                }
                            });
                            receiptId = receipt.id;
                        }
                    } catch (fileErr) {
                        console.error("File upload error:", fileErr);
                    }
                }

                await prisma.expenseItem.create({
                    data: {
                        reportId: existingReport.id,
                        amount: parseFloat(item.amount),
                        description: item.description,
                        payer: item.payer || 'employee', // Default to employee if missing
                        date: new Date(),
                        categoryId: item.categoryId || 1,
                        receiptId: receiptId
                    }
                });
            }

        } else {
            // Create new Report
            const report = await prisma.expenseReport.create({
                data: {
                    tripId: parseInt(id),
                    totalAmount: totalAmount,
                    status: 'SUBMITTED'
                }
            });

            // Process items one by one
            for (const item of items) {
                let receiptId = null;

                if (item.fileData) {
                    try {
                        if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

                        const matches = item.fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                        if (matches && matches.length === 3) {
                            const buffer = Buffer.from(matches[2], 'base64');
                            const extension = matches[1].split('/')[1] || 'bin';
                            const fileName = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
                            
                            fs.writeFileSync(`uploads/${fileName}`, buffer);

                            const receipt = await prisma.receipt.create({
                                data: {
                                    fileName: fileName,
                                    fileUrl: `/uploads/${fileName}`
                                }
                            });
                            receiptId = receipt.id;
                        }
                    } catch (fileErr) {
                        console.error("File upload error:", fileErr);
                    }
                }

                await prisma.expenseItem.create({
                    data: {
                        reportId: report.id,
                        amount: parseFloat(item.amount),
                        description: item.description,
                        payer: item.payer || 'employee',
                        date: new Date(),
                        categoryId: item.categoryId || 1,
                        receiptId: receiptId
                    }
                });
            }
        }

        // 2. Update Trip Status to 5 (Wysłana do rozliczenia)
        const trip = await prisma.businessTrip.update({
            where: { id: parseInt(id) },
            data: { statusId: 5 }
        });

        res.json({ message: "Rozliczenie wysłane", trip });
    } catch (error) {
        console.error("SETTLEMENT ERROR:", error.message);
        
        console.error("SETTLEMENT ERROR:", error);
        res.status(500).json({ error: "Błąd zapisywania rozliczenia" });
    }
});

// POST /trips/:id/expenses - Dodawanie POJEDYNCZEGO wydatku (Mobile)
app.post("/trips/:id/expenses", async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description, currency, category, receiptImage } = req.body;

        // 1. Znajdź lub stwórz raport
        let report = await prisma.expenseReport.findUnique({ where: { tripId: parseInt(id) } });
        if (!report) {
            report = await prisma.expenseReport.create({
                data: {
                    tripId: parseInt(id),
                    totalAmount: 0, 
                    status: 'DRAFT'
                }
            });
        }

        // 2. Obsługa zdjęcia (Receipt)
        let receiptId = null;
        if (receiptImage) {
             try {
                if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

                const matches = receiptImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const buffer = Buffer.from(matches[2], 'base64');
                    const extension = matches[1].split('/')[1] || 'bin';
                    const fileName = `receipt_mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
                    
                    fs.writeFileSync(`uploads/${fileName}`, buffer);

                    const receipt = await prisma.receipt.create({
                        data: {
                            fileName: fileName,
                            fileUrl: `/uploads/${fileName}`
                        }
                    });
                    receiptId = receipt.id;
                }
            } catch (fileErr) {
                console.error("File upload error (Mobile):", fileErr);
            }
        }

        // 3. Stwórz ExpenseItem
        const newItem = await prisma.expenseItem.create({
            data: {
                reportId: report.id,
                amount: parseFloat(amount),
                description: description,
                payer: 'employee',
                date: new Date(),
                categoryId: 1,
                receiptId: receiptId
            }
        });

        res.json(newItem);

    } catch (error) {
        console.error("Błąd dodawania wydatku mobilnego:", error);
        res.status(500).json({ error: "Błąd zapisu wydatku" });
    }
});

// GET /manager/stats - Statystyki dla Dashboardu
app.get("/manager/stats", async (req, res) => {
    try {
        const { userId } = req.query;
        // Logic: Managers see ALL trips (except maybe their own, but we disabled that restriction).
        
        const total = await prisma.businessTrip.count();
        const toApprove = await prisma.businessTrip.count({ where: { statusId: 1 } });
        const toSettle = await prisma.businessTrip.count({ where: { statusId: 5 } });
        const finished = await prisma.businessTrip.count({ where: { statusId: { in: [3, 4] } } }); 

        // New counters for Admin Dashboard
        const usersCount = await prisma.user.count();
        const citiesCount = await prisma.city.count();
        const hotelsCount = await prisma.hotel.count();

        res.json({ total, toApprove, toSettle, finished, usersCount, citiesCount, hotelsCount });
    } catch (error) {
        res.status(500).json({ error: "Błąd statystyk" });
    }
});

// GET /manager/pending-trips - Wnioski do akceptacji (statusId=1, inne niż moje)
app.get("/manager/pending-trips", async (req, res) => {
    try {
        const { userId, statusId } = req.query; // ID managera, statu, który chcemy pobrać
        
        // Domyślnie statusId = 1 (Nowa), ale pozwalamy nadpisać
        const targetStatus = statusId ? parseInt(statusId) : 1;
        
        const where = { statusId: targetStatus };

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
            data: { statusId: 2 }
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

// PATCH /manager/settle-finish/:id (Rozliczona - ID 4)
app.patch("/manager/settle-finish/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await prisma.businessTrip.update({
            where: { id: parseInt(id) },
            data: { statusId: 4 } 
        });
        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: "Błąd rozliczania" });
    }
});

// PATCH /manager/settle-return/:id (Do poprawki - ID 6)
app.patch("/manager/settle-return/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await prisma.businessTrip.update({
            where: { id: parseInt(id) },
            data: { statusId: 6 } 
        });
        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: "Błąd zwracania do poprawki" });
    }
});


// GET /trips/:id - Szczegóły dla Managera i Usera
app.get("/trips/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await prisma.businessTrip.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
                destination: {
                    include: { country: true } // Fetches Country Name !
                },
                status: true,
                accommodations: {
                    include: { hotel: true }
                },
                transports: {
                    include: { provider: true }
                },
                expenseReport: {
                    include: {
                        items: {
                            include: { receipt: true }
                        }
                    }
                }
            }
        });
        if (!trip) return res.status(404).json({ error: "Nie znaleziono" });
        
        // Mapowanie struktur dla Frontendu
        const tripResponse = { ...trip };
        
        if (trip.accommodations && trip.accommodations.length > 0) {
            tripResponse.hotel = trip.accommodations[0].hotel;
            // Now hotel has 'price' (decimal)
        }
        
        if (trip.transports && trip.transports.length > 0) {
            tripResponse.transportRoute = {
                provider: trip.transports[0].provider,
                price: trip.transports[0].cost, // Mapujemy koszt bookingu na 'price'
                originCityId: 1 // Zakładamy Warszawę (hardcode, bo Booking nie ma info o trasie)
            };
        }

        // Add settlement info if exists
        if (trip.expenseReport) {
            tripResponse.settlement = trip.expenseReport;
        }

        res.json(tripResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Błąd pobierania szczegółów" });
    }
});

// GET /my-trips - Delegacje zalogowanego użytkownika (Mobile)
app.get("/my-trips", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "Brak tokenu" });
        
        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Błędny token" });

        // Używamy biblioteki jwt do weryfikacji i dekodowania
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        if (!userId) return res.status(401).json({ error: "Brak ID w tokenie" });

        const trips = await prisma.businessTrip.findMany({
            where: { userId: parseInt(userId) },
            include: { destination: true, status: true },
            orderBy: { startDate: 'asc' }
        });
        res.json(trips);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Błąd pobierania moich delegacji" });
    }
});

// GET /trips - Lista delegacji (opcjonalnie filtr ?userId=...)
app.get("/trips", async (req, res) => {
    const { userId, limit } = req.query;
    try {
        const where = userId ? { userId: parseInt(userId) } : {};
        const take = limit ? parseInt(limit) : undefined;
        
        const trips = await prisma.businessTrip.findMany({
            where,
            include: { destination: true, status: true, user: true },
            orderBy: { id: 'desc' },
            take: take
        });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: "Błąd pobierania delegacji" });
    }
});

// --- 9. SZABLONY DOKUMENTÓW (ZSI Compliance) ---

app.get("/templates/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const template = await prisma.documentTemplate.findUnique({ where: { name } });
        res.json(template || { content: "" });
    } catch (error) {
        res.status(500).json({ error: "Błąd pobierania szablonu" });
    }
});

app.put("/templates/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const { content } = req.body;
        const template = await prisma.documentTemplate.upsert({
            where: { name },
            update: { content },
            create: { name, content }
        });
        res.json(template);
    } catch (error) {
        res.status(500).json({ error: "Błąd zapisu szablonu" });
    }
});

// --- SERVER START & SEED ---

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
    
    // 5. TransportProvider (Rozszerzona lista)
    // Update PKP -> PKP Intercity if exists
    const pkpOld = await prisma.transportProvider.findFirst({ where: { name: "PKP" } });
    if (pkpOld) {
        await prisma.transportProvider.update({ where: { id: pkpOld.id }, data: { name: "PKP Intercity" } });
        console.log("✅ Zaktualizowano nazwę dostawcy: PKP -> PKP Intercity");
    }

    // 6. Default Document Template (PDF Footer)
    const footerTemplate = await prisma.documentTemplate.findUnique({ where: { name: "PDF_FOOTER" } });
    if (!footerTemplate) {
        await prisma.documentTemplate.create({
            data: {
                name: "PDF_FOOTER",
                content: "Dokument wygenerowany automatycznie w systemie BetterBT. Nie wymaga podpisu ręcznego."
            }
        });
        console.log("✅ Dodano domyślny szablon stopki PDF");
    }

    const providerNames = ["PKP Intercity", "LOT", "Uber", "Lufthansa", "Emirates", "Ryanair", "Bolt", "DB (Deutsche Bahn)"];
    for (const pName of providerNames) {
        const exists = await prisma.transportProvider.findFirst({ where: { name: pName } });
        if (!exists) {
            await prisma.transportProvider.create({ data: { name: pName } });
            console.log(`✅ Dodano dostawcę: ${pName}`);
        }
    }

    // 6. SEED ROUTES (Trasy)
    // Sprawdzamy czy mamy już jakieś trasy, jeśli mało to dodajemy
    if ((await prisma.transportRoute.count()) < 15) { // Zwiększamy limit, żeby dodało nowe
        console.log("⚠️ Mało tras w bazie. Dodaję bogatą siatkę połączeń...");
        
        // Słowniki
        const waw = await prisma.city.findFirst({ where: { name: { contains: "Warszawa" } } });
        const krk = await prisma.city.findFirst({ where: { name: { contains: "Kraków" } } });
        const gdn = await prisma.city.findFirst({ where: { name: { contains: "Gdańsk" } } }); // Nowe
        const lon = await prisma.city.findFirst({ where: { name: { contains: "Londyn" } } });
        const par = await prisma.city.findFirst({ where: { name: { contains: "Paryż" } } });
        const dub = await prisma.city.findFirst({ where: { name: { contains: "Dubaj" } } });
        const ber = await prisma.city.findFirst({ where: { name: { contains: "Berlin" } } }); // Nowe

        const typeTrain = await prisma.transportType.findFirst({ where: { name: "Pociąg" } });
        const typePlane = await prisma.transportType.findFirst({ where: { name: "Samolot" } });
        const typeCar = await prisma.transportType.findFirst({ where: { name: "Auto" } });

        const pLot = await prisma.transportProvider.findFirst({ where: { name: "LOT" } });
        const pPkp = await prisma.transportProvider.findFirst({ where: { name: "PKP Intercity" } });
        const pUber = await prisma.transportProvider.findFirst({ where: { name: "Uber" } });
        const pLuf = await prisma.transportProvider.findFirst({ where: { name: "Lufthansa" } });
        const pRyan = await prisma.transportProvider.findFirst({ where: { name: "Ryanair" } });
        const pEmir = await prisma.transportProvider.findFirst({ where: { name: "Emirates" } });
        const pBolt = await prisma.transportProvider.findFirst({ where: { name: "Bolt" } });
        const pDb = await prisma.transportProvider.findFirst({ where: { name: "DB (Deutsche Bahn)" } });

        const newRoutes = [];

        // --- TRASY KRAJOWE: WARSZAWA - KRAKÓW ---
        if (waw && krk) {
            if (pPkp && typeTrain) newRoutes.push({ originCityId: waw.id, destinationCityId: krk.id, transportTypeId: typeTrain.id, providerId: pPkp.id, price: 169, currency: "PLN" }); // Pendolino
            if (pLot && typePlane) newRoutes.push({ originCityId: waw.id, destinationCityId: krk.id, transportTypeId: typePlane.id, providerId: pLot.id, price: 299, currency: "PLN" });
            if (pUber && typeCar)  newRoutes.push({ originCityId: waw.id, destinationCityId: krk.id, transportTypeId: typeCar.id, providerId: pUber.id, price: 1100, currency: "PLN" });
            if (pBolt && typeCar)  newRoutes.push({ originCityId: waw.id, destinationCityId: krk.id, transportTypeId: typeCar.id, providerId: pBolt.id, price: 1050, currency: "PLN" }); // Nowe
        }

        // --- TRASY KRAJOWE: WARSZAWA - GDAŃSK (Nowe) ---
        if (waw && gdn) {
            if (pPkp && typeTrain) newRoutes.push({ originCityId: waw.id, destinationCityId: gdn.id, transportTypeId: typeTrain.id, providerId: pPkp.id, price: 199, currency: "PLN" }); // Pendolino nad morze
            if (pLot && typePlane) newRoutes.push({ originCityId: waw.id, destinationCityId: gdn.id, transportTypeId: typePlane.id, providerId: pLot.id, price: 350, currency: "PLN" });
            if (pRyan && typePlane) newRoutes.push({ originCityId: waw.id, destinationCityId: gdn.id, transportTypeId: typePlane.id, providerId: pRyan.id, price: 99, currency: "PLN" }); // Tanie loty
        }

        // --- TRASY MIĘDZYNARODOWE: WARSZAWA - LONDYN ---
        if (waw && lon && typePlane) {
            if (pLot)  newRoutes.push({ originCityId: waw.id, destinationCityId: lon.id, transportTypeId: typePlane.id, providerId: pLot.id, price: 850, currency: "PLN" });
            if (pRyan) newRoutes.push({ originCityId: waw.id, destinationCityId: lon.id, transportTypeId: typePlane.id, providerId: pRyan.id, price: 250, currency: "PLN" });
            if (pLuf)  newRoutes.push({ originCityId: waw.id, destinationCityId: lon.id, transportTypeId: typePlane.id, providerId: pLuf.id, price: 920, currency: "PLN" });
        }

        // --- TRASY MIĘDZYNARODOWE: WARSZAWA - DUBAJ ---
        if (waw && dub && typePlane) {
            if (pEmir) newRoutes.push({ originCityId: waw.id, destinationCityId: dub.id, transportTypeId: typePlane.id, providerId: pEmir.id, price: 3200, currency: "PLN" });
            if (pLot)  newRoutes.push({ originCityId: waw.id, destinationCityId: dub.id, transportTypeId: typePlane.id, providerId: pLot.id, price: 2400, currency: "PLN" });
        }

        // --- TRASY MIĘDZYNARODOWE: WARSZAWA - PARYŻ ---
        if (waw && par && typePlane) {
            if (pLot) newRoutes.push({ originCityId: waw.id, destinationCityId: par.id, transportTypeId: typePlane.id, providerId: pLot.id, price: 950, currency: "PLN" });
            if (pLuf) newRoutes.push({ originCityId: waw.id, destinationCityId: par.id, transportTypeId: typePlane.id, providerId: pLuf.id, price: 1050, currency: "PLN" });
        }

        // --- TRASY MIĘDZYNARODOWE: WARSZAWA - BERLIN (Nowe) ---
        if (waw && ber) {
             if (pPkp && typeTrain) newRoutes.push({ originCityId: waw.id, destinationCityId: ber.id, transportTypeId: typeTrain.id, providerId: pPkp.id, price: 250, currency: "PLN" }); // Berlin-Warszawa-Express
             if (pDb && typeTrain)  newRoutes.push({ originCityId: waw.id, destinationCityId: ber.id, transportTypeId: typeTrain.id, providerId: pDb.id, price: 280, currency: "PLN" }); // Deutsche Bahn
             if (pLot && typePlane) newRoutes.push({ originCityId: waw.id, destinationCityId: ber.id, transportTypeId: typePlane.id, providerId: pLot.id, price: 600, currency: "PLN" });
        }

        if (newRoutes.length > 0) {
            // Dodajemy tylko te, których jeszcze nie ma (uproszczone: po prostu createMany, ignorujemy duplikaty w logice "business" ale prisma createMany nie ma skipDuplicates dla sqlite/niektórych db, więc tu po prostu dodajemy)
            // W środowisku dev to ok.
            await prisma.transportRoute.createMany({ data: newRoutes });
            console.log(`✅ Dodano ${newRoutes.length} nowych tras!`);
        }
    }

  } catch (e) {
    console.log("Info: Baza danych gotowa (seed check completed).", e);
  }
});
