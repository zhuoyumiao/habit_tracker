const $ = (id) => document.getElementById(id);

$("fullName").textContent = localStorage.getItem("fullName");
$("email").textContent = localStorage.getItem("email");
$("display-fullName").textContent = localStorage
  .getItem("fullName")
  .split(" ")[0];

// Sign out
$("signOut").addEventListener("click", async () => {
  localStorage.removeItem("authToken");
  window.location.href = "/login.html";
});

// Settings
$("settings").addEventListener("click", async () => {
  window.location.href = "/settings.html";
});
