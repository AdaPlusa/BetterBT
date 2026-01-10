const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Removing 'Księgowy' role...");
  try {
    const role = await prisma.role.findFirst({ where: { name: "Księgowy" } });
    if (role) {
      // Opcjonalnie: przenieś użytkowników z tą rolą do roli User (2)
      await prisma.user.updateMany({
        where: { roleId: role.id },
        data: { roleId: 2 }
      });
      
      await prisma.role.delete({ where: { id: role.id } });
      console.log("✅ Rola 'Księgowy' usunięta.");
    } else {
      console.log("ℹ️ Rola 'Księgowy' nie istnieje.");
    }
  } catch (e) {
    console.error("Błąd podczas usuwania roli:", e);
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
