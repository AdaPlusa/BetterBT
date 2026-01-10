const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.expenseCategory.findMany();
  console.log("--- EXPENSE CATEGORIES ---");
  console.log(categories);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
