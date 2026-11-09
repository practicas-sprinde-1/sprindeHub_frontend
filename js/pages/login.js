import { login } from "../api/auth.api.js";

const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");

loginForm.addEventListener("submit", handleLoginSubmit);

async function handleLoginSubmit(event) {
  event.preventDefault();

  try {
    loginMessage.textContent = "Iniciando sesión...";

    const credentials = getLoginCredentials(loginForm);
    const tokenData = await login(credentials);

    storeSessionTokens(tokenData);
    window.location.replace("/index.html");
  } catch (error) {
    loginMessage.textContent =
      error.message || "No se ha podido iniciar sesión.";
  }
}

function getLoginCredentials(form) {
  const formData = new FormData(form);

  return {
    email: formData.get("email"),
    password: formData.get("password"),
  };
}

function storeSessionTokens(tokenData) {
  sessionStorage.setItem("accessToken", tokenData.access_token);
  sessionStorage.setItem("refreshToken", tokenData.refresh_token);
}
