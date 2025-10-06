// routes/stats.js
import { Router } from "express";
import { getDB } from "../db/connect.js";
import bcrypt from "bcrypt";
const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { username, password, name, email, lastLoginAt } = req.body;
    const user = await getDB().collection("users").findOne({ username });

    if (!user)
      return res.status(401).json({ error: "Invalid username or password" });

    bcrypt.compare(password, user.password, (err) => {
      if (err)
        return res.status(401).json({ error: "Invalid username or password" });
    });

    const token = jwt.sign({ username }, process.env.JWT_SECRET);

    res.header("Authorization", `Bearer ${token}`).json({
      message: "Login successful",
      user: {
        username,
        name,
        email,
        lastLoginAt,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { username, password, name, email } = req.body;

    const user = await getDB().collection("users").findOne({ username });

    if (user)
      return res.status(400).json({
        error: "Username already exists",
      });

    await getDB().collection("users").insertOne({
      username,
      password,
      name,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    });

    res.json({
      message: "Registration successful",
      user: {
        username,
        name,
        email,
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
