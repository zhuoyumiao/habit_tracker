// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDB } from "./db/connect.js";
import habitsRouter from "./routes/habits.js";
import todayRouter from "./routes/today.js";
import statsRouter from "./routes/stats.js";
import authRouter from "./routes/authentication.js";
import authenticate from "./middleware/authenticate.js";
import userRouter from "./routes/user.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api", authenticate);
// API routes
app.use("/api/habits", habitsRouter);
app.use("/api/today", todayRouter);
app.use("/api/stats", statsRouter);
app.use("/api/user", userRouter);

// 404 for API
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// Global error handler
app.use((err, _req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
  next();
});

connectDB()
  .then(() => app.listen(PORT, () => console.log(`http://localhost:${PORT}`)))
  .catch((e) => {
    console.error("Failed to start server:", e);
    process.exit(1);
  });
