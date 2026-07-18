import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
async function main() {
    

const hashedPassword = await bcrypt.hash("password123", 10);
const jasir = await prisma.user.upsert({
  where: {
    username: "jasir",
  },
  update: {},
  create: {
    username: "jasir",
    name: "Jasir",
    password: hashedPassword,
  },
});

const ahmed = await prisma.user.upsert({
  where: {
    username: "ahmed",
  },
  update: {},
  create: {
    username: "ahmed",
    name: "ahmed",
    password: hashedPassword,
  },
});

const conversation = await prisma.conversation.create({
    data: {}
});

await prisma.conversationMember.create({
  data: {
    userId: jasir.id,
    conversationId: conversation.id,
  },
});

await prisma.conversationMember.create({
  data: {
    userId: ahmed.id,
    conversationId: conversation.id,
  },
});

await prisma.message.create({
  data: {
    text: "Hello Ahmed!",
    authorId: jasir.id,
    conversationId: conversation.id,
  },
});
await prisma.message.create({
  data: {
    text: "Hi Jasir!",
    authorId: ahmed.id,
    conversationId: conversation.id,
  },
});
}
main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });