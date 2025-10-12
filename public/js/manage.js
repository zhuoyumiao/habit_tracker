/* global bootstrap */
// /js/manage.js
import api from "./api.js";

const elGrid = document.getElementById("grid");
const elCount = document.getElementById("habitCount");
const modal = new bootstrap.Modal(document.getElementById("addModal"));
const elInput = document.getElementById("habitName");
const elCreate = document.getElementById("createHabit");
const elOpen = document.getElementById("openAdd");

let habits = [];

// Every habit card
function cardTemplate(h) {
  return `
<div class="card p-3 mb-3">
  <div class="d-flex justify-content-between align-items-center">
  <span>${h.name}</span>
  <div class="btn-group">
    <button class="btn btn-sm btn-outline-secondary" data-edit="${h._id}" data-name="${h.name}">Edit</button>
    <button class="btn btn-sm btn-outline-danger" data-del="${h._id}">Delete</button>
  </div>
  </div>
</div>
`;
}

// Render all habits
async function render() {
  habits = await api.get("/api/habits");
  elCount.textContent = `${habits.length} habit${habits.length === 1 ? "" : "s"}`;
  elGrid.innerHTML = habits.map(cardTemplate).join("");
}

// Click add habit - show modal
elOpen.addEventListener("click", () => {
  elInput.value = "";
  modal.show();
  setTimeout(() => elInput.focus(), 200);
});

// Click create add habit
elCreate.addEventListener("click", async () => {
  const name = elInput.value.trim();
  if (!name) return;
  await api.post("/api/habits", { name });
  modal.hide();
  render();
});

// Click delete habit
elGrid.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-del]");
  if (!btn) return;
  const id = btn.getAttribute("data-del");
  if (!confirm("Delete this habit?")) return;
  await api.del(`/api/habits/${id}`);
  render();
});

// Click edit habit (rename)
elGrid.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-edit]");
  if (!btn) return;
  const id = btn.getAttribute("data-edit");
  const oldName = btn.getAttribute("data-name") || "";

  const newName = prompt("Rename this habit:", oldName);
  if (newName === null) return;
  const name = newName.trim();
  if (!name || name === oldName.trim()) return;

  await api.put(`/api/habits/${id}`, { name });
  await render();
});

render();
