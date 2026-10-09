import { register } from "../api/auth.api.js";

//Crea una variable buscando el elemento cuyo id sea 'login-form # -> id .->clase'
const registerForm = document.querySelector("#register-form");

registerForm.addEventListener("submit", async (event) => {
  const registerMessage = document.querySelector("#register-message");
  //No se ejecuta la acción automática del navegador
  event.preventDefault();
  //crea un objeto con los datos del formulario
  const formData = new FormData(registerForm);

  const credentials = {
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  };

  try {
    const userData = await register(credentials);

    registerMessage.textContent = "Registro completado. Iniciando sesión...";

    window.location.replace("/index.html");
  } catch (error) {
    registerMessage.textContent =
      error.message || "No se ha podido crear la cuenta.";
  }
});
