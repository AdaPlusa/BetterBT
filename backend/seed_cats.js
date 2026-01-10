const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.expenseCategory.createMany({
    data: [
      { id: 1, name: "Inne" },
      { id: 2, name: "Transport" },
      { id: 3, name: "Hotel" },
      { id: 4, name: "Dieta" }
    ],
    skipDuplicates: true
  });
  console.log("Seeded Categories");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
