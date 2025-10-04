// db/connect.js
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) throw new Error("Missing MONGODB_URI in .env");
if (!dbName) throw new Error("Missing DB_NAME in .env");

let client;
let db;

export async function connectDB() {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  // Ensure indexes once
  await db
    .collection("checkins")
    .createIndex({ habitId: 1, date: 1 }, { unique: true });
  await db.collection("habits").createIndex({ name: 1 });

  console.log("Connected to MongoDB");
  return db;
}

export function getDB() {
  if (!db) throw new Error("DB not initialized. Call connectDB() first.");
  return db;
}

export { ObjectId };
