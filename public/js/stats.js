// js/stats.js
import { api } from "./api.js";

// Small helpers
const $ = (id) => document.getElementById(id);

// Add s to day if it is plural
function plural(n, unit = "day") {
  const num = Number(n) || 0;
  return `${num} ${unit}${num === 1 ? "" : "s"}`;
}

// Today's Rate: /api/stats/overview
async function loadToday() {
  const t = await api.get("/api/stats/overview");
  $("m-today").textContent = `${t.today.ratePercent}%`;
  $("m-today-sub").textContent = `${t.today.done}/${t.today.total} habits`;
}

// Overview metrics: /api/stats/overview
async function loadOverview() {
  const o = await api.get("/api/stats/overview");

  // Longest / Average streak
  $("m-longest").textContent = plural(o.streaks?.longestStreak);
  $("m-avg").textContent = plural(o.streaks?.averageLongestStreak);

  // Total check-ins
  $("m-total").textContent = o.totals?.totalCheckins ?? 0;

  // Best habit
  const best = o.bestHabit;
  if (best) {
    $("best-name").textContent = best.name || "Unknown";
    $("best-sub").textContent = `${best.completions} total`;
    $("best-rate").textContent = `${Math.round((best.rate || 0) * 100)}%`;
  } else {
    $("best-name").textContent = "—";
    $("best-sub").textContent = "—";
    $("best-rate").textContent = "—";
  }
}

async function render() {
  await loadToday();
  await loadOverview();
}

render();
