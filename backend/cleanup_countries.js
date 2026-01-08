const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Starting Country Cleanup...");

  // Names as they likely appear in DB (Polish)
  // User said "Kanade", usually stored as "Kanada".
  const countriesToRemove = ["Brazylia", "Meksyk", "Indie", "Kanada"];

  for (const countryName of countriesToRemove) {
      const country = await prisma.country.findFirst({ where: { name: countryName } });
      
      if (!country) {
          console.log(`⚠️  Country not found: ${countryName}`);
          continue;
      }

      console.log(`Analyzing ${countryName} (ID: ${country.id})...`);

      // 1. Find Cities
      const cities = await prisma.city.findMany({ where: { countryId: country.id } });
      const cityIds = cities.map(c => c.id);
      console.log(`   Found ${cities.length} cities: ${cities.map(c => c.name).join(", ")}`);

      if (cityIds.length > 0) {
          // 2. Delete Hotels in these cities
          const deletedHotels = await prisma.hotel.deleteMany({
              where: { cityId: { in: cityIds } }
          });
          console.log(`   - Deleted ${deletedHotels.count} hotels`);

          // 3. Delete Transport Routes (Origin or Destination)
          const deletedRoutes = await prisma.transportRoute.deleteMany({
              where: {
                  OR: [
                      { originCityId: { in: cityIds } },
                      { destinationCityId: { in: cityIds } }
                  ]
              }
          });
          console.log(`   - Deleted ${deletedRoutes.count} routes`);

          // 4. Delete Business TRIPS (linked to these cities as destination)
          // Note: If trips exist, we must delete bookings first.
          
          // Find trips to these cities
          const trips = await prisma.businessTrip.findMany({ 
              where: { destinationId: { in: cityIds } } 
          });
          const tripIds = trips.map(t => t.id);

          if (tripIds.length > 0) {
              // Delete bookings for these trips
              await prisma.transportBooking.deleteMany({ where: { tripId: { in: tripIds } } });
              await prisma.accommodationBooking.deleteMany({ where: { tripId: { in: tripIds } } });
              await prisma.expenseReport.deleteMany({ where: { tripId: { in: tripIds } } }); // Cascade usually handles this? Safety first.
              
              const deletedTrips = await prisma.businessTrip.deleteMany({
                  where: { id: { in: tripIds } }
              });
              console.log(`   - Deleted ${deletedTrips.count} trips`);
          }

          // 5. Delete Cities
          await prisma.city.deleteMany({ where: { id: { in: cityIds } } });
          console.log(`   - Deleted ${cities.length} cities`);
      }

      // 6. Delete Country
      await prisma.country.delete({ where: { id: country.id } });
      console.log(`✅ Deleted Country: ${countryName}`);
  }

  console.log("🎉 Cleanup Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
