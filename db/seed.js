// db/seed.js
// generate random 2000 records
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const client = new MongoClient(uri);

const todayStr = () => new Date().toLocaleDateString("en-CA");

function randomDateStr() {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * 90));
  return d.toLocaleDateString("en-CA");
}

async function seed() {
  await client.connect();
  const db = client.db(dbName);
  const usersCol = db.collection("users");
  const habitsCol = db.collection("habits");
  const checkinsCol = db.collection("checkins");

  // clear all records
  await Promise.all([
    usersCol.deleteMany({}),
    habitsCol.deleteMany({}),
    checkinsCol.deleteMany({}),
  ]);

  const HASH = bcrypt.hashSync("Passw0rd!", 10);

  // 50 users
  const users = [];
  for (let i = 1; i <= 50; i++) {
    users.push({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      password: HASH,
      createdAt: new Date(),
    });
  }
  const userResult = await usersCol.insertMany(users);
  const userIds = Object.values(userResult.insertedIds);

  console.log(`Inserted ${userIds.length} users`);

  // 10 habits per user
  const habitNames = [
    "Drink Water",
    "Exercise",
    "Read Book",
    "Meditate",
    "Sleep Early",
    "Study",
    "Eat Breakfast",
    "Walk 6000 Steps",
    "Write Journal",
    "Call Parents",
  ];

  const habits = [];
  for (const userId of userIds) {
    for (const name of habitNames) {
      habits.push({
        userId,
        name,
        isActive: true,
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
      });
    }
  }
  const habitResult = await habitsCol.insertMany(habits);
  const habitIds = Object.values(habitResult.insertedIds);
  console.log(`Inserted ${habitIds.length} habits`);

  // 1500 checkins
  const TOTAL_CHECKINS = 1500;
  const checkins = [];
  const seen = new Set();
  const today = todayStr();

  for (let u = 0; u < Math.min(5, userIds.length); u++) {
    const userId = userIds[u];
    const userHabits = habitIds.slice(u * 10, u * 10 + 3);
    for (const h of userHabits) {
      const key = `${h}|${today}`;
      seen.add(key);
      checkins.push({
        userId,
        habitId: h,
        date: today,
        completed: Math.random() > 0.2,
        timestamp: new Date(),
      });
    }
  }

  let attempts = 0;
  while (checkins.length < TOTAL_CHECKINS) {
    const habitId = habitIds[Math.floor(Math.random() * habitIds.length)];
    const userId =
      habits.find((h) => h._id?.equals?.(habitId))?.userId ??
      userIds[Math.floor(Math.random() * userIds.length)];
    const date = randomDateStr();
    const key = `${habitId}|${date}`;
    if (seen.has(key)) {
      if (++attempts > TOTAL_CHECKINS * 10) break;
      continue;
    }
    seen.add(key);
    checkins.push({
      userId,
      habitId,
      date,
      completed: Math.random() > 0.3,
      timestamp: new Date(),
    });
  }

  await checkinsCol.insertMany(checkins, { ordered: false });
  console.log(`Inserted ${checkins.length} checkins`);

  console.log(
    "Seeding complete. Total ≈",
    userIds.length + habitIds.length + checkins.length
  );

  await client.close();
}

seed().catch((e) => {
  console.error("Seeding error:", e);
  process.exit(1);
});
