export default function login() {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);

    const data = Object.fromEntries(formData);

    console.log(data);

    fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        const authHeader = res.headers.get("Authorization");
        if (authHeader) {
          localStorage.setItem("authToken", authHeader.replace("Bearer ", ""));
        }

        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (data.error) {
          const loginError = document.getElementById("loginError");
          loginError.classList.remove("d-none");
          loginError.textContent = data.error;

          setTimeout(() => {
            loginError.classList.add("d-none");
          }, 3000);
        } else {
          window.location.href = "/index.html";
        }
      });
  });
}

login();
