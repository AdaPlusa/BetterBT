const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const hotelChains = [
    "Hilton", "Marriott", "Sheraton", "Radisson Blu", "Novotel", 
    "Ibis", "Mercure", "Holiday Inn", "Sofitel", "Hyatt"
];

const suffixes = [
    "Centre", "Airport", "Old Town", "Business Park", "City", 
    "Grand", "Plaza", "Premium", "Budget", "Suites"
];

async function main() {
  console.log("--- SEEDING HOTELS ---");

  // 1. Get all cities
  const cities = await prisma.city.findMany();
  if (cities.length === 0) {
    console.error("❌ No cities found! Cannot add hotels.");
    return;
  }
  console.log(`ℹ️ Found ${cities.length} cities.`);

  // 2. Generate ~20 hotels
  const hotelsData = [];
  for (let i = 0; i < 20; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const chain = hotelChains[Math.floor(Math.random() * hotelChains.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    hotelsData.push({
      name: `${chain} ${city.name} ${suffix}`,
      cityId: city.id
    });
  }

  // 3. Insert
  await prisma.hotel.createMany({
    data: hotelsData
  });

  console.log("✅ Successfully added 20 hotels!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
