import api from "./api.js";

// js/index.js
// Small helpers
const $ = (id) => document.getElementById(id);

// Show today's date and time
function formatNiceDate() {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatNiceTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function itemTemplate(habit, completed) {
  // Button based on state
  const btnClass = completed ? "btn-success" : "btn-primary";
  const btnText = completed ? "Completed" : "Check In";

  return `
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body d-flex align-items-center justify-content-between">
        <div class="me-3">
          <div class="fw-semibold">${habit.name}</div>
        </div>
        <button class="btn ${btnClass} px-4" data-toggle="${habit._id}">${btnText}</button>
      </div>
    </div>
  `;
}

async function render() {
  // Load today data
  const today = await api.get("/api/today");

  // Header
  $("theDate").textContent = formatNiceDate(today.date);
  $("theTime").textContent = formatNiceTime();

  // Progress
  $("countBadge").textContent = `${today.done}/${today.total}`;
  $("progressBar").style.width = `${today.progress}%`;
  const remaining = Math.max(0, today.total - today.done);
  $("remaining").textContent =
    remaining > 0
      ? `${remaining} habit${remaining === 1 ? "" : "s"} remaining`
      : "All done";

  // Pending count
  const pending = today.habits.filter((h) => !h.completed).length;
  $("pendingCount").textContent = pending;

  // Habit list
  const html = today.habits
    .sort((a, b) => Number(a.completed) - Number(b.completed))
    .map((h) => itemTemplate(h, h.completed))
    .join("");
  $("list").innerHTML = html;
}

// Toggle handler
$("list").addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-toggle]");
  if (!btn) return;
  const id = btn.getAttribute("data-toggle");
  try {
    await api.post(`/api/today/${id}/toggle`);
    await render();
  } catch (err) {
    console.error(err);
    alert("Action failed. Please try again.");
  }
});

// Sign out
$("signOut").addEventListener("click", async () => {
  localStorage.removeItem("authToken");
  window.location.href = "/login.html";
});

// Settings
$("settings").addEventListener("click", async () => {
  window.location.href = "/settings.html";
});

// Initial load
// Live clock for time subtitle
render();
setInterval(() => {
  $("theTime").textContent = formatNiceTime();
}, 30_000);
