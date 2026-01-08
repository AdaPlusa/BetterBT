const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🛠️  Starting Data Fix & Seeding...");

  // 1. REMOVE SPECIFIC CITIES (Singapore, Madrid)
  const citiesToRemove = ["Singapur", "Madryt"];
  const countriesToRemove = ["Chiny"]; // User asked to remove Singapore (City) and maybe country if empty. 
  // User said "usuń też Singapur cąłkiem z projektu i Madryt".
  // Singapur is a country in my prev seed... wait.
  // In `seed_routes_realistic.js`, "Singapur" was not added as a country, but "Chiny" and "Japonia" were.
  // Let's check if "Singapur" exists as a City or Country.
  
  // Strategy: Find City by name -> Delete related (Hotels, Routes) -> Delete City.
  
  for (const name of citiesToRemove) {
      const city = await prisma.city.findFirst({ where: { name: name } });
      if (city) {
          console.log(`🗑️  Removing City: ${name}...`);
          
          // Delete Hotels
          await prisma.hotel.deleteMany({ where: { cityId: city.id } });
          
          // Delete Routes
          await prisma.transportRoute.deleteMany({
              where: { 
                  OR: [
                      { originCityId: city.id },
                      { destinationCityId: city.id }
                  ]
              }
          });

          // Delete Trips (if any exist for this city - keeping it clean)
          await prisma.businessTrip.deleteMany({ where: { destinationId: city.id } });

          // Delete City
          await prisma.city.delete({ where: { id: city.id } });
          console.log(`✅ Removed ${name}`);
      }
  }

  // 2. CHECK & SEED HOTELS (3-4 per city)
  const allCities = await prisma.city.findMany({ include: { hotels: true } });
  
  const hotelNamesSuffix = ["Plaza", "Grand Hotel", "Resort & Spa", "City Center", "Boutique", "Lodge", "Inn", "Suites"];
  const hotelAdjectives = ["Luxurious", "Cozy", "Modern", "Historic", "Elegant", "Budget", "Royal", "Sunny"];

  for (const city of allCities) {
      const currentCount = city.hotels.length;
      const targetCount = 3 + Math.floor(Math.random() * 2); // 3 or 4
      
      if (currentCount < targetCount) {
          const needed = targetCount - currentCount;
          console.log(`🏨 Seeding ${needed} hotels for ${city.name}...`);
          
          for (let i = 0; i < needed; i++) {
              const adj = hotelAdjectives[Math.floor(Math.random() * hotelAdjectives.length)];
              const suffix = hotelNamesSuffix[Math.floor(Math.random() * hotelNamesSuffix.length)];
              const name = `${adj} ${city.name} ${suffix}`;
              const price = 200 + Math.floor(Math.random() * 600); // 200-800 PLN logic (mock for now, hotels don't have separate price field in schema yet, logic is in Wizard, but name is key)
              
              const exists = await prisma.hotel.findFirst({ where: { name, cityId: city.id } });
              if (!exists) {
                  await prisma.hotel.create({
                      data: {
                          name: name,
                          cityId: city.id,
                          imageUrl: "" // Empty or placeholder
                      }
                  });
              }
          }
      }
  }

  // 3. ENSURE ROUTE FROM WARSZAWA TO EVERY CITY
  const warsaw = await prisma.city.findFirst({ where: { name: "Warszawa" } });
  
  if (warsaw) {
      // Refresh cities list
      const updatedCities = await prisma.city.findMany({ 
          where: { id: { not: warsaw.id } },
          include: { country: true } // Need continent to decide transport type
      });

      // Fetch Transport Types & Providers
      const plane = await prisma.transportType.findFirst({ where: { name: "Samolot" } });
      const train = await prisma.transportType.findFirst({ where: { name: "Pociąg" } });
      
      const lot = await prisma.transportProvider.findFirst({ where: { name: "LOT" } });
      const pkp = await prisma.transportProvider.findFirst({ where: { name: "PKP Intercity" } });
      
      // Fallback
      const anyProvider = await prisma.transportProvider.findFirst();

      for (const city of updatedCities) {
           // Check if route exists Warsaw -> City
           const existingRoute = await prisma.transportRoute.findFirst({
               where: {
                   originCityId: warsaw.id,
                   destinationCityId: city.id
               }
           });

           if (!existingRoute) {
               console.log(`🛣️  Creating route Warsaw -> ${city.name}...`);
               
               let typeId, providerId, price;
               
               // Logic: Poland = Train, Europe/World = Plane
               if (city.country.name === "Polska" && train && pkp) {
                   typeId = train.id;
                   providerId = pkp.id;
                   price = 100 + Math.floor(Math.random() * 100);
               } else if (plane && lot) {
                   typeId = plane.id;
                   providerId = lot.id;
                   price = 500 + Math.floor(Math.random() * 3000);
               } else {
                   // Fallback
                   typeId = plane ? plane.id : (train ? train.id : 1);
                   providerId = anyProvider ? anyProvider.id : 1;
                   price = 999;
               }

               await prisma.transportRoute.create({
                   data: {
                       originCityId: warsaw.id,
                       destinationCityId: city.id,
                       transportTypeId: typeId,
                       providerId: providerId,
                       price: price,
                       currency: "PLN"
                   }
               });
           }
      }
  } else {
      console.error("❌ Critical: Warsaw not found in DB!");
  }

  console.log("✨ Data Fix Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
