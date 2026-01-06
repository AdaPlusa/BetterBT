const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const cities = await prisma.city.count();
  const hotels = await prisma.hotel.count();
  const trips = await prisma.businessTrip.count();

  console.log("--- DB COUNTS ---");
  console.log(`Users: ${users}`);
  console.log(`Cities: ${cities}`);
  console.log(`Hotels: ${hotels}`);
  console.log(`Trips: ${trips}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
