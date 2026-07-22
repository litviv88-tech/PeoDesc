import { PrismaClient, Visibility } from "@prisma/client";

const prisma = new PrismaClient();

const TEST_OWNER_EMAIL = "owner@peodesc.test";
const TEST_VOTER_EMAIL = "voter@peodesc.test";

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: TEST_OWNER_EMAIL },
    update: { name: "Тестовый автор" },
    create: { email: TEST_OWNER_EMAIL, name: "Тестовый автор" },
  });

  const voter = await prisma.user.upsert({
    where: { email: TEST_VOTER_EMAIL },
    update: { name: "Тестовый голосующий" },
    create: { email: TEST_VOTER_EMAIL, name: "Тестовый голосующий" },
  });

  const category = await prisma.category.upsert({
    where: { category: "Сон и режим" },
    update: {},
    create: { category: "Сон и режим" },
  });

  const note = await prisma.note.create({
    data: {
      ownerId: owner.id,
      title: "Тестовый публичный совет",
      content: "Короткий текст совета для проверки связей User → Note → Vote.",
      description: "Создано скриптом prisma/verify-domain.ts",
      categoryId: category.id,
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
    },
  });

  const vote = await prisma.vote.upsert({
    where: {
      userId_noteId: {
        userId: voter.id,
        noteId: note.id,
      },
    },
    update: { value: 1 },
    create: {
      userId: voter.id,
      noteId: note.id,
      value: 1,
    },
  });

  const counts = {
    users: await prisma.user.count(),
    notes: await prisma.note.count(),
    votes: await prisma.vote.count(),
  };

  console.log("OK: доменная проверка пройдена");
  console.log(JSON.stringify({ ownerId: owner.id, voterId: voter.id, noteId: note.id, voteId: vote.id, counts }, null, 2));
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
