// pnpm add uuid mongodb
import { PrismaClient as Pg } from '@prisma/client';
import { MongoClient } from 'mongodb';
import { randomUUID } from 'crypto';

const pg = new Pg();
const mongo = new MongoClient(
  'mongodb+srv://pdthang2000:loYc6dqtzwDWgL3v@cluster0.l9yrivy.mongodb.net/flex-cards?retryWrites=true&w=majority',
);

export async function run() {
  await mongo.connect();
  const db = mongo.db(); // your db name
  const Users = db.collection('User');
  const Tags = db.collection('Tag');
  const Flashcards = db.collection('Flashcard');
  const FlashcardTags = db.collection('FlashcardTag');

  const idMap = new Map<string, string>(); // old -> new

  // users
  for await (const u of Users.find({})) {
    const newId = randomUUID();
    console.log('newId', newId);
    idMap.set(String(u._id), newId);
  }
  console.log('Running...');
  // tags
  const adminId = randomUUID();
  await pg.user.create({
    data: {
      id: adminId,
      name: 'thangfkphan',
      email: 'thangfkphan@gmail.com',
    },
  });
  for await (const t of Tags.find({})) {
    const newId = randomUUID();
    idMap.set(String(t._id), newId);
    await pg.tag.create({
      data: {
        id: newId,
        name: t.name,
        createdBy: adminId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        deletedAt: t.deletedAt ?? null,
      },
    });
  }
  console.log('Running...');
  // flashcards
  for await (const f of Flashcards.find({})) {
    const newId = randomUUID();
    idMap.set(String(f._id), newId);
    await pg.flashcard.create({
      data: {
        id: newId,
        front: f.front,
        back: f.back,
        createdBy: adminId,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        deletedAt: f.deletedAt ?? null,
      },
    });
  }
  console.log('Running...');
  // flashcardTag
  for await (const ft of FlashcardTags.find({})) {
    await pg.flashcardTag.create({
      data: {
        id: randomUUID(),
        flashcardId: idMap.get(String(ft.flashcardId))!,
        tagId: idMap.get(String(ft.tagId))!,
        createdBy: adminId,
        createdAt: ft.createdAt,
      },
    });
  }
  console.log('Running...');
  await mongo.close();
  await pg.$disconnect();
}
run().catch(console.error);
