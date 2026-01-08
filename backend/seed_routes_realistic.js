const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting realistic seeding...");

  // 1. KRAJE I MIASTA
  const countriesData = [
    { 
      name: "Polska", code: "PL", continent: "Europa", perDiemRate: 45, 
      cities: ["Warszawa", "Kraków", "Gdańsk", "Łódź", "Wrocław"] 
    },
    { 
      name: "Niemcy", code: "DE", continent: "Europa", perDiemRate: 200, 
      cities: ["Berlin", "Monachium", "Hamburg", "Frankfurt"] 
    },
    { 
      name: "USA", code: "US", continent: "Ameryka Północna", perDiemRate: 300, 
      cities: ["New York", "Los Angeles", "Chicago", "San Francisco"] 
    },
    { 
      name: "Chiny", code: "CN", continent: "Azja", perDiemRate: 250, 
      cities: ["Szanghaj", "Pekin"] 
    },
    { 
      name: "Japonia", code: "JP", continent: "Azja", perDiemRate: 350, 
      cities: ["Tokio", "Kioto"] 
    },
    { 
      name: "Szwecja", code: "SE", continent: "Europa", perDiemRate: 280, 
      cities: ["Sztokholm", "Goteborg"] 
    }
  ];

  const cityMap = {}; // name -> id

  for (const cData of countriesData) {
    // Upsert Country manually
    let country = await prisma.country.findFirst({ where: { name: cData.name } });
    if (country) {
        country = await prisma.country.update({
            where: { id: country.id },
            data: { 
                continent: cData.continent,
                perDiemRate: cData.perDiemRate
            }
        });
        console.log(`🔄 Updated Country: ${cData.name}`);
    } else {
        country = await prisma.country.create({ 
            data: { 
                name: cData.name, 
                code: cData.code, 
                continent: cData.continent,
                perDiemRate: cData.perDiemRate
            } 
        });
        console.log(`✅ Created Country: ${cData.name}`);
    }

    // Upsert Cities
    for (const cityName of cData.cities) {
        // Find existing city to avoid duplicate errors if uniqueness is not constrained
        // Assuming unique name per country for simplicity in seeding
        let city = await prisma.city.findFirst({
            where: { name: cityName, countryId: country.id }
        });
        
        if (!city) {
            city = await prisma.city.create({
                data: { name: cityName, countryId: country.id }
            });
            console.log(`+ City: ${cityName} (${cData.name})`);
        }
        cityMap[cityName] = city.id;
    }
  }

  // 2. TYPY I DOSTAWCY
  const typesData = [
    { name: "Samolot", providers: ["LOT", "Lufthansa", "Ryanair", "Emirates", "Air China", "SAS"] },
    { name: "Pociąg", providers: ["PKP Intercity", "Deutsche Bahn", "Shinkansen"] },
    { name: "Taxi", providers: ["Uber", "Bolt", "iTaxi"] }
  ];

  const providerMap = {}; // name -> id
  const typeMap = {}; // name -> id

  for (const tData of typesData) {
      let type = await prisma.transportType.findFirst({ where: { name: tData.name } });
      if (!type) {
          type = await prisma.transportType.create({ data: { name: tData.name } });
      }
      typeMap[tData.name] = type.id;

      for (const provName of tData.providers) {
          let prov = await prisma.transportProvider.findFirst({ where: { name: provName } });
          if (!prov) {
              prov = await prisma.transportProvider.create({
                  data: { name: provName, typeId: type.id }
              });
              console.log(`+ Provider: ${provName}`);
          } else {
             // Ensure type is correct (fix migration issues)
             await prisma.transportProvider.update({
                 where: { id: prov.id },
                 data: { typeId: type.id }
             });
          }
          providerMap[provName] = prov.id;
      }
  }

  // 3. TRASY (ROUTES)
  // format: [origin, destination, type, provider, price, currency]
  const routesToSeed = [
    // PL Domestic (Train)
    ["Warszawa", "Kraków", "Pociąg", "PKP Intercity", 150, "PLN"],
    ["Warszawa", "Gdańsk", "Pociąg", "PKP Intercity", 180, "PLN"],
    ["Warszawa", "Łódź", "Pociąg", "PKP Intercity", 45, "PLN"],
    ["Kraków", "Gdańsk", "Pociąg", "PKP Intercity", 220, "PLN"],
    
    // PL Domestic (Taxi - request: only PL)
    ["Warszawa", "Łódź", "Taxi", "Uber", 400, "PLN"],
    ["Kraków", "Katowice", "Taxi", "Bolt", 250, "PLN"], // Katowice might need creating... lets stick to existing
    // If Katowice not in list, this skips. I'll stick to defined cities.
    
    // International (Flights)
    ["Warszawa", "Berlin", "Samolot", "LOT", 600, "PLN"],
    ["Warszawa", "Berlin", "Samolot", "Lufthansa", 750, "PLN"],
    ["Warszawa", "Berlin", "Pociąg", "Deutsche Bahn", 300, "PLN"], // Train to DE
    
    ["Warszawa", "New York", "Samolot", "LOT", 3500, "PLN"],
    ["Warszawa", "New York", "Samolot", "Lufthansa", 4200, "PLN"],
    
    ["Warszawa", "Sztokholm", "Samolot", "SAS", 900, "PLN"],
    ["Warszawa", "Sztokholm", "Samolot", "Ryanair", 250, "PLN"],
    
    ["Warszawa", "Pekin", "Samolot", "Air China", 4000, "PLN"],
    ["Warszawa", "Tokio", "Samolot", "LOT", 5500, "PLN"],
    
    // Cross-country
    ["Berlin", "Paryż", "Samolot", "Lufthansa", 1200, "PLN"], // Paryż requires France...
    // Let's stick to our map.
    ["Berlin", "New York", "Samolot", "Lufthansa", 3800, "PLN"],
  ];

  console.log("Creating Routes...");
  for (const [from, to, typeName, providerName, price, currency] of routesToSeed) {
      const originId = cityMap[from];
      const destId = cityMap[to];
      const typeId = typeMap[typeName];
      const providerId = providerMap[providerName];

      if (!originId || !destId) {
          console.warn(`⚠️  Skipping route ${from}->${to} (City not found)`);
          continue;
      }
      if (!typeId || !providerId) {
         console.warn(`⚠️  Skipping route ${from}->${to} (Type/Prov not found)`);
         continue;
      }

      // Check existence
      const existing = await prisma.transportRoute.findFirst({
          where: {
              originCityId: originId,
              destinationCityId: destId,
              providerId: providerId,
              transportTypeId: typeId
          }
      });

      if (!existing) {
          await prisma.transportRoute.create({
              data: {
                  originCityId: originId,
                  destinationCityId: destId,
                  transportTypeId: typeId,
                  providerId: providerId,
                  price: parseFloat(price),
                  currency: currency
              }
          });
          console.log(`✅ Route: ${from} -> ${to} (${providerName})`);
      } else {
        // Update price
        await prisma.transportRoute.update({
             where: { id: existing.id },
             data: { price: parseFloat(price) }
        });
        console.log(`🔄 Updated: ${from} -> ${to} (${providerName})`);
      }
  }

  // Ensure 1 route per country (at least from Warsaw to Capital or major city)
  // (Covered mostly above)
  
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
