const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Checking Roles...");
  
  const roles = ["Admin", "User", "Manager", "Księgowy"];
  
  for (const name of roles) {
    const exists = await prisma.role.findFirst({ where: { name } });
    if (!exists) {
      await prisma.role.create({ data: { name } });
      console.log(`✅ Added Role: ${name}`);
    } else {
      console.log(`👌 Role exists: ${name}`);
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
