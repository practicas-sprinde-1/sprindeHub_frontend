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
    const response = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
      method: "POST",
      headers: {
        //Le dice al servidor el tipo de contenido que envía la app
        "Content-Type": "application/json",
      },
      //manda las credenciales en formato .json
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      loginMessage.textContent = " No se ha podido iniciar sesión.";
      return;
    }

    loginMessage.textContent = "Iniciando sesión...";

    //Guarda el token de la API del tipo Token creado en el backend.

    const tokenData = await response.json();

    //Guarda el access_token en el navegador. Al cerrar la pestaña, se borra.

    sessionStorage.setItem("accessToken", tokenData.access_token);

    window.location.replace("/index.html");
  } catch (error) {
    loginMessage.textContent = "No se ha podido conectar con el servidor.";
  }
});
