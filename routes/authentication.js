// routes/stats.js
import { Router } from "express";
import { getDB } from "../db/connect.js";
import bcrypt from "bcrypt";
const router = Router();
import jwt from "jsonwebtoken";

router.post("/login", async (req, res, next) => {
  try {
    const { password, email } = req.body;
    const user = await getDB().collection("users").findOne({ email });

    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const result = bcrypt.compareSync(password, user.password);
    if (!result)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ email }, process.env.JWT_SECRET);

    res
      .status(200)
      .header("Authorization", `Bearer ${token}`)
      .json({
        message: "Login successful",
        token,
        user: {
          name: user.name,
          email,
          lastLoginAt: new Date(),
        },
      });
  } catch (e) {
    next(e);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { password, name, email } = req.body;

    const user = await getDB().collection("users").findOne({ email });

    if (user)
      return res.status(400).json({
        error: "Email already exists",
      });

    await getDB()
      .collection("users")
      .insertOne({
        password: bcrypt.hashSync(password, 10),
        name,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      });

    res
      .status(201)
      .header(
        "Authorization",
        `Bearer ${jwt.sign({ email }, process.env.JWT_SECRET)}`
      )
      .json({
        message: "Registration successful",
        token: jwt.sign({ email }, process.env.JWT_SECRET),
        user: {
          name,
          email,
        },
      });
  } catch (e) {
    next(e);
  }
});

export default router;
