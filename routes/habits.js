// routes/habits.js
// habits with CRUD
import { Router } from "express";
import { getDB, ObjectId } from "../db/connect.js";
const router = Router();

// GET /api/habits — get active habits
router.get("/", async (req, res, next) => {
  const userObjectId = new ObjectId(req.user.id);
  try {
    const habits = await getDB()
      .collection("habits")
      .find({
        userId: userObjectId,
        isActive: { $ne: false },
      })
      .sort({ createdAt: 1 })
      .toArray();
    res.json(habits);
  } catch (e) {
    next(e);
  }
});

// POST /api/habits — add habit { name }
router.post("/", async (req, res, next) => {
  const userObjectId = new ObjectId(req.user.id);
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "Name is required" });
    const doc = {
      userId: userObjectId,
      name,
      isActive: true,
      createdAt: new Date(),
    };
    const r = await getDB().collection("habits").insertOne(doc);
    res.status(201).json({ _id: r.insertedId, ...doc });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/habits/:id — delete habit (and related checkin)
router.delete("/:id", async (req, res, next) => {
  const userObjectId = new ObjectId(req.user.id);
  try {
    const id = new ObjectId(req.params.id);
    await getDB().collection("checkins").deleteMany({ habitId: id });
    const r = await getDB()
      .collection("habits")
      .deleteOne({ _id: id, userId: userObjectId });
    if (!r.deletedCount) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, deletedId: id });
  } catch (e) {
    next(e);
  }
});

// PUT /api/habits/:id {name}
router.put("/:id", async (req, res, next) => {
  const userObjectId = new ObjectId(req.user.id);
  try {
    const id = new ObjectId(req.params.id);

    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "Name is required" });

    const col = getDB().collection("habits");
    const r = await col.updateOne(
      { _id: id, userId: userObjectId },
      { $set: { name, updatedAt: new Date() } }
    );

    if (!r.matchedCount) return res.status(404).json({ error: "Not found" });

    const doc = await col.findOne({ _id: id, userId: userObjectId });
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

export default router;
