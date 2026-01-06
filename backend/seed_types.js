const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const types = ["Samolot", "Taxi", "Pociąg"];
  console.log("Checking Transport Types...");
  
  for (const name of types) {
    const exists = await prisma.transportType.findFirst({ where: { name } });
    if (!exists) {
      await prisma.transportType.create({ data: { name } });
      console.log(`✅ Added: ${name}`);
    } else {
      console.log(`👌 Already exists: ${name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
