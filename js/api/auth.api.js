export async function login(credentials) {
  const response = await fetch(`http://127.0.0.1:8000/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("No se ha podido iniciar sesión.");
  }

  return response.json();
}

export async function register(credentials) {
  const response = await fetch(`http://127.0.0.1:8000/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  console.log("Peticion hecha");

  if (!response.ok) {
    throw new Error("No se ha podido completar el registro.");
  }

  return response.json();
}
