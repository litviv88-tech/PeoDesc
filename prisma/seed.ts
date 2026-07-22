import { PrismaClient, Visibility } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "seed@peodesc.local" },
    update: {},
    create: { email: "seed@peodesc.local", name: "Seed пользователь" },
  });

  const category = await prisma.category.upsert({
    where: { category: "Общее" },
    update: {},
    create: { category: "Общее" },
  });

  await prisma.vote.deleteMany();
  await prisma.noteTag.deleteMany();
  await prisma.note.deleteMany();

  const notes = [
    {
      title: "Первый совет: режим дня",
      content: "Стабильный режим сна и бодрствования помогает ребёнку чувствовать себя спокойнее.",
      visibility: Visibility.PRIVATE,
    },
    {
      title: "Как успокоить ребёнка перед сном",
      content: "Тёплая ванна, приглушённый свет и спокойный ритуал перед укладыванием.",
      visibility: Visibility.PRIVATE,
    },
    {
      title: "Полезные книги для родителей",
      content: "Подборка книг для спокойных вечеров и уверенности в родительстве.",
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
    },
  ];

  for (const item of notes) {
    await prisma.note.create({
      data: {
        ownerId: owner.id,
        title: item.title,
        content: item.content,
        categoryId: category.id,
        visibility: item.visibility,
        publishedAt: item.publishedAt ?? null,
      },
    });
  }
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
