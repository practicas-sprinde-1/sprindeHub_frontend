export async function login(credentials) {
  return sendCredentials(
    "http://127.0.0.1:8000/api/v1/auth/login",
    credentials,
    "No se ha podido iniciar sesión.",
  );
}

export async function register(credentials) {
  return sendCredentials(
    "http://127.0.0.1:8000/api/v1/auth/register",
    credentials,
    "No se ha podido completar el registro.",
  );
}

// Envía los datos de acceso al endpoint indicado y devuelve el usuario recibido.
async function sendCredentials(url, credentials, errorMessage) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}
