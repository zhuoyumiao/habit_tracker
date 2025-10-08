// routes/today.js
import { Router } from "express";
import { getDB, ObjectId } from "../db/connect.js";
const router = Router();

function todayStr() {
  return new Date().toLocaleDateString("en-US");
}

// GET /api/today — list habits with today completion state
router.get("/", async (req, res, next) => {
  try {
    const db = getDB();
    const [habits, checkins] = await Promise.all([
      db
        .collection("habits")
        .find({ isActive: { $ne: false }, userId: req.user.id })
        .sort({ createdAt: 1 })
        .toArray(),
      db
        .collection("checkins")
        .find({ date: todayStr(), completed: true, userId: req.user.id })
        .toArray(),
    ]);

    // today's habits list
    const done = new Set(checkins.map((c) => c.habitId.toString()));

    const list = habits.map((h) => ({
      _id: h._id,
      name: h.name,
      completed: done.has(h._id.toString()),
    }));

    // today's stat
    const total = list.length;
    const completed = list.filter((x) => x.completed).length;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    // return
    res.json({
      date: todayStr(),
      total,
      done: completed,
      progress,
      habits: list,
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/today/:habitId/toggle — toggle today completion
router.post("/:habitId/toggle", async (req, res, next) => {
  try {
    const db = getDB();
    const habitId = new ObjectId(req.params.habitId);
    const date = todayStr();
    const checkin = db.collection("checkins");

    const existing = await checkin.findOne({ habitId, date });
    if (existing?.completed) {
      await checkin.deleteOne({ _id: existing._id });
      return res.json({ completed: false });
    }
    await checkin.updateOne(
      { habitId, date, userId: req.user.id },
      { $set: { completed: true, timestamp: new Date() } },
      { upsert: true }
    );
    res.json({ completed: true });
  } catch (e) {
    next(e);
  }
});

export default router;
