// routes/habits.js
import { Router } from "express";
import { getDB, ObjectId } from "../db/connect.js";
const router = Router();

// GET /api/habits — get active habits
router.get("/", async (req, res, next) => {
  try {
    const habits = await getDB()
      .collection("habits")
      .find({ isActive: { $ne: false }, userId: req.user.id })
      .sort({ createdAt: 1 })
      .toArray();
    res.json(habits);
  } catch (e) {
    next(e);
  }
});

// POST /api/habits — add habit { name }
router.post("/", async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "Name is required" });
    const doc = {
      name,
      isActive: true,
      createdAt: new Date(),
      userId: req.user.id,
    };
    const r = await getDB().collection("habits").insertOne(doc);
    res.status(201).json({ _id: r.insertedId, ...doc });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/habits/:id — delete habit (and related checkin)
router.delete("/:id", async (req, res, next) => {
  try {
    const id = new ObjectId(req.params.id);
    await getDB().collection("checkins").deleteMany({ habitId: id });
    const r = await getDB().collection("habits").deleteOne({ _id: id });
    if (!r.deletedCount) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, deletedId: id });
  } catch (e) {
    next(e);
  }
});

export default router;
