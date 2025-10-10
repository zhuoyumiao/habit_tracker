// routes/stats.js
import { Router } from "express";
import { getDB, ObjectId } from "../db/connect.js";
const router = Router();

const toDayKey = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString("en-CA");
};

const todayStr = () => toDayKey(new Date());

// GET /api/stats/overview
// A more detailed overview from beginning to today
router.get("/overview", async (req, res, next) => {
  try {
    const db = getDB();
    const today = todayStr();
    const userObjectId = new ObjectId(req.user.id);

    const [habits, checkins, todayDone] = await Promise.all([
      db
        .collection("habits")
        .find({ userId: userObjectId, isActive: { $ne: false } })
        .project({ name: 1 })
        .toArray(),
      db
        .collection("checkins")
        .find({ userId: userObjectId, completed: true, date: { $lte: today } })
        .project({ habitId: 1, date: 1 })
        .toArray(),
      db
        .collection("checkins")
        .countDocuments({ userId: userObjectId, date: today, completed: true }),
    ]);

    const totalHabits = habits.length;
    const totalCheckins = checkins.length;
    const nameById = new Map(habits.map((h) => [h._id.toString(), h.name]));
    const allDates = Array.from(new Set(checkins.map((c) => c.date))).sort();

    // Map each habit to completed dates
    const datesByHabit = new Map();
    for (const c of checkins) {
      const id = c.habitId.toString();
      if (!datesByHabit.has(id)) datesByHabit.set(id, new Set());
      datesByHabit.get(id).add(c.date);
    }

    // Helper function to compute longest streak
    function longestStreak(dateSet) {
      if (!dateSet || dateSet.size === 0) return 0;
      let best = 0,
        cur = 0,
        prev = null;
      for (const d of allDates) {
        if (!dateSet.has(d)) {
          cur = 0;
          prev = null;
          continue;
        }
        // check whether they are neighbors
        if (prev) {
          const diff = (new Date(d) - new Date(prev)) / 86400000;
          cur = diff === 1 ? cur + 1 : 1;
        } else cur = 1;
        if (cur > best) best = cur;
        prev = d;
      }
      return best;
    }

    // Calculate all the info
    let longestStreakAll = 0;
    let sumLongest = 0;
    let bestHabit = null;
    const totalDays = allDates.length || 1;

    for (const h of habits) {
      const id = h._id.toString();
      const set = datesByHabit.get(id);
      const ls = longestStreak(set);
      if (ls > longestStreakAll) longestStreakAll = ls;
      sumLongest += ls;

      const completions = set?.size || 0;
      const rate = completions / totalDays;
      if (!bestHabit || rate > bestHabit.rate) {
        bestHabit = {
          habitId: id,
          name: nameById.get(id) || "Unknown",
          completions,
          rate: +rate.toFixed(3),
        };
      }
    }

    let avgStreak;
    if (habits.length > 0) {
      avgStreak = +(sumLongest / habits.length).toFixed(2);
    } else {
      avgStreak = 0;
    }

    let todaysRate;
    if (totalHabits > 0) {
      todaysRate = Math.round((todayDone / totalHabits) * 100);
    } else {
      todaysRate = 0;
    }

    // return
    res.json({
      today: {
        date: today,
        done: todayDone,
        total: totalHabits,
        ratePercent: todaysRate,
      },
      totals: { totalCheckins },
      streaks: {
        longestStreak: longestStreakAll,
        averageLongestStreak: avgStreak,
      },
      bestHabit,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
