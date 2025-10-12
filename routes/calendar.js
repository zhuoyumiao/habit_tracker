import { Router } from "express";
import { createEvents } from "ics";
import { getDB, ObjectId } from "../db/connect.js";
import authenticate from "../middleware/authenticate.js";

const router = Router();

function todayStr() {
  return new Date().toLocaleDateString("en-CA");
}

router.get("/:id/habits.ics", async (req, res) => {
  const userId = new ObjectId(req.params.id);
  const today = new Date();

  const db = getDB();

  // Get user by _id (from users collection)
  const user = await db.collection("users").findOne({ _id: userId });
  if (!user) {
    return res.status(404).send("User not found");
  }

  const [habits, checkins] = await Promise.all([
    db
      .collection("habits")
      .find({
        userId: userId,
        isActive: { $ne: false },
      })
      .sort({ createdAt: 1 })
      .toArray(),
    db
      .collection("checkins")
      .find({
        userId: userId,
        date: todayStr(),
        completed: true,
      })
      .toArray(),
  ]);

  const done = new Set(checkins.map((c) => c.habitId?.toString()));

  const list = habits.map((h) => ({
    _id: h._id,
    name: h.name,
    completed: done.has(h._id.toString()),
  }));

  const completed = list.filter((x) => x.completed);

  const events = completed.map((c) => ({
    start: [today.getFullYear(), today.getMonth() + 1, today.getDate(), 0, 0], // month +1 (ics months are 1-based)
    duration: { hours: 24, minutes: 0 },
    title: c.name,
    location: "Habit Tracker",
    url: "http://example.com/habit-tracker",
    alarms: Array.from({ length: 12 }, (_, i) => ({
      action: "display",
      description: `Habit Tracker reminder (${i * 2}:00)`,
      trigger: { hours: -(24 - i * 2), minutes: 0, before: true },
      repeat: 0,
    })),
  }));

  createEvents(events, (error, value) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error generating ICS file");
    }

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="calendar.ics"');
    res.send(value);
  });
});

router.get("/get-calendar-url", authenticate, (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");
  const calendarUrl = `${baseUrl}/api/calendar/${req.user.id}/habits.ics`;
  res.json({ calendarUrl });
});

export default router;
