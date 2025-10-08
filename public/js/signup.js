export default function register() {
  const signupForm = document.getElementById("signupForm");

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(signupForm);

    const data = Object.fromEntries(formData);

    console.log(data);

    fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        console.log(res.headers);

        const authHeader = res.headers.get("Authorization");
        if (authHeader) {
          localStorage.setItem("authToken", authHeader.replace("Bearer ", ""));
        }

        return res.json();
      })
      .then((data) => {
        if (data.error) {
          const signupError = document.getElementById("signupError");
          signupError.classList.remove("d-none");
          signupError.textContent = data.error;

          setTimeout(() => {
            signupError.classList.add("d-none");
          }, 3000);
        } else {
          window.location.href = "/index.html";

          localStorage.setItem("fullName", data.user.name);
          localStorage.setItem("email", data.user.email);
        }
      });
  });
}

register();
