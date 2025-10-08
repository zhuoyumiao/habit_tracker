const $ = (id) => document.getElementById(id);

$("fullName").textContent = localStorage.getItem("fullName");
$("email").textContent = localStorage.getItem("email");
$("display-fullName").textContent = localStorage
  .getItem("fullName")
  .split(" ")[0];
