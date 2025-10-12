// routes/stats.js
import { Router } from "express";
import { getDB } from "../db/connect.js";
import bcrypt from "bcrypt";

const router = Router();

router.put("/update-name", async (req, res) => {
  const { name } = req.body;

  const user = await getDB()
    .collection("users")
    .findOne({ email: req.user.email });

  if (!user) return res.status(404).json({ error: "User not found" });

  await getDB()
    .collection("users")
    .updateOne({ email: req.user.email }, { $set: { name } });

  res.json({
    message: "Name updated",
    user: {
      ...req.user,
      name,
    },
  });
});

router.put("/update-password", async (req, res) => {
  const { password, newPassword } = req.body;

  if (!newPassword)
    return res.status(400).json({ error: "New password is required" });

  const user = await getDB()
    .collection("users")
    .findOne({ email: req.user.email });

  if (!user) return res.status(404).json({ error: "User not found" });

  const result = bcrypt.compareSync(password, user.password);
  if (!result) return res.status(401).json({ error: "Invalid password" });

  await getDB()
    .collection("users")
    .updateOne(
      { email: req.user.email },
      { $set: { password: bcrypt.hashSync(newPassword, 10) } }
    );

  res.json({
    message: "Password updated",
  });
});

router.delete("/delete-account", async (req, res) => {
  const user = await getDB()
    .collection("users")
    .findOne({ email: req.user.email });

  if (!user) return res.status(404).json({ error: "User not found" });

  await getDB().collection("users").deleteOne({ email: req.user.email });

  res.json({
    message: "Account deleted",
  });
});

export default router;
