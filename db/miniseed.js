// db/miniseed.js
// generate some records
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const client = new MongoClient(uri);

const todayStr = () => new Date().toLocaleDateString("en-US");

async function seedMini() {
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
  const { insertedIds: userIds } = await usersCol.insertMany([
    {
      name: "Alice",
      email: "alice@example.com",
      password: HASH,
      createdAt: new Date(),
    },
    {
      name: "Bob",
      email: "bob@example.com",
      password: HASH,
      createdAt: new Date(),
    },
  ]);
  const aliceId = userIds["0"];
  const bobId = userIds["1"];

  // habits
  const { insertedIds: habitIds } = await habitsCol.insertMany([
    {
      userId: aliceId,
      name: "Drink Water",
      isActive: true,
      createdAt: new Date(),
    },
    {
      userId: aliceId,
      name: "Read Book",
      isActive: true,
      createdAt: new Date(),
    },
    { userId: bobId, name: "Exercise", isActive: true, createdAt: new Date() },
    { userId: bobId, name: "Meditate", isActive: true, createdAt: new Date() },
  ]);

  // checkins
  const today = todayStr();
  await checkinsCol.insertMany([
    {
      userId: aliceId,
      habitId: habitIds["0"],
      date: today,
      completed: true,
      timestamp: new Date(),
    },
    {
      userId: aliceId,
      habitId: habitIds["1"],
      date: today,
      completed: false,
      timestamp: new Date(),
    },
    {
      userId: bobId,
      habitId: habitIds["2"],
      date: today,
      completed: true,
      timestamp: new Date(),
    },
    {
      userId: bobId,
      habitId: habitIds["3"],
      date: today,
      completed: true,
      timestamp: new Date(),
    },
  ]);

  console.log("Mini seed (ObjectId) done.");
  console.log("Alice _id:", aliceId.toString());
  console.log("Bob   _id:", bobId.toString());
  console.log("Today   :", today);

  await client.close();
}

seedMini().catch((e) => {
  console.error("Seeding error:", e);
  process.exit(1);
});
