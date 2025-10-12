const $ = (id) => document.getElementById(id);

console.log("settings.js");

const fullNameSettings = $("fullNameSettings");
const emailSettings = $("emailSettings");
const updateNameBtn = $("updateName-btn");

fullNameSettings.value = localStorage.getItem("fullName");
emailSettings.value = localStorage.getItem("email");

updateNameBtn.addEventListener("click", () => {
  const name = fullNameSettings.value;
  if (!name) return;
  if (name === localStorage.getItem("fullName")) {
    alert("Name is the same as the current name");
    return;
  }

  fetch("/api/user/update-name", {
    method: "put",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify({ name }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        localStorage.setItem("fullName", data.user.name);
        window.location.reload();
      }
    })
    .catch((err) => {
      alert(err.message);
    });
});

fullNameSettings.addEventListener("input", () => {
  console.log($("fullNameSettings").value);

  if (fullNameSettings.value === localStorage.getItem("fullName")) {
    updateNameBtn.disabled = true;
    updateNameBtn.classList.remove("btn-success");
  } else {
    updateNameBtn.disabled = false;
    updateNameBtn.classList.add("btn-success");
  }
});

const updatePasswordBtn = $("updatePassword-btn");
const currentPassword = $("currentPassword");
const newPassword = $("newPassword");
const confirmPassword = $("confirmPassword");

confirmPassword.addEventListener("input", () => {
  if (newPassword.value === confirmPassword.value) {
    updatePasswordBtn.disabled = false;
    updatePasswordBtn.classList.add("btn-success");
  } else {
    updatePasswordBtn.disabled = true;
    updatePasswordBtn.classList.remove("btn-success");
  }
});

updatePasswordBtn.addEventListener("click", () => {
  const passwordValue = currentPassword.value;
  const newPasswordValue = newPassword.value;
  const confirmPasswordValue = confirmPassword.value;

  if (!newPasswordValue) return;
  if (newPasswordValue !== confirmPasswordValue) {
    alert("New password and confirm password do not match");
    return;
  }

  fetch("/api/user/update-password", {
    method: "put",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify({
      password: passwordValue,
      newPassword: newPasswordValue,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
        return;
      }
      alert(data.message);
      window.location.reload();
    })
    .catch((err) => {
      console.error(err);
    });
});

const deleteAccountBtn = $("deleteAccount-btn");

deleteAccountBtn.addEventListener("click", () => {
  if (!confirm("Delete account?")) return;

  fetch("/api/user/delete-account", {
    method: "delete",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
        return;
      }
      alert(data.message);
      window.location.href = "/login.html";
      localStorage.removeItem("authToken");
      localStorage.removeItem("fullName");
      localStorage.removeItem("email");
    })
    .catch((err) => {
      console.error(err);
    });
});
