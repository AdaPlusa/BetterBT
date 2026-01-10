const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Updating Trip Statuses...");

  // Statuses to ensure exist
  const statuses = [
    { id: 1, name: "Nowa" },
    { id: 2, name: "Zatwierdzona" },
    { id: 3, name: "Odrzucona" },
    { id: 4, name: "Rozliczona" },
    { id: 5, name: "Wysłana do rozliczenia" },
    { id: 6, name: "Do poprawki" }
  ];

  for (const status of statuses) {
    await prisma.tripStatus.upsert({
      where: { id: status.id },
      update: { name: status.name },
      create: { id: status.id, name: status.name }
    });
    console.log(`- Upserted: ${status.name} (ID: ${status.id})`);
  }

  console.log("Trip statuses updated successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
