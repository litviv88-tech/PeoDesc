import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.note.deleteMany();

  await prisma.note.create({ data: { title: "Первый совет: режим дня" } });
  await prisma.note.create({
    data: { title: "Как успокоить ребёнка перед сном" },
  });
  await prisma.note.create({
    data: { title: "Полезные книги для родителей" },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
