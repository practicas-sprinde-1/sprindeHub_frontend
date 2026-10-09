import { login } from "../api/auth.api.js";

//Crea una variable buscando el elemento cuyo id sea 'login-form # -> id .->clase'
const loginForm = document.querySelector("#login-form");

loginForm.addEventListener("submit", async (event) => {
  const loginMessage = document.querySelector("#login-message");
  //No se ejecuta la acción automática del navegador
  event.preventDefault();
  //crea un objeto con los datos del formulario
  const formData = new FormData(loginForm);

  const credentials = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  try {
    loginMessage.textContent = "Iniciando sesión...";

    const tokenData = await login(credentials);

    sessionStorage.setItem("accessToken", tokenData.access_token);

    console.log(tokenData);

    window.location.replace("/index.html");
  } catch (error) {
    loginMessage.textContent =
      error.message || "No se ha podido iniciar sesión.";
  }
});
