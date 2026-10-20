const API_URL = "http://127.0.0.1:8000/api/v1";

export async function login(credentials) {
  return sendCredentials(
    `${API_URL}/auth/login`,
    credentials,
    "No se ha podido iniciar sesión.",
  );
}

export async function register(credentials) {
  return sendCredentials(
    `${API_URL}/auth/register`,
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

export async function refreshAccessToken() {
  const refreshToken = sessionStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No existe un refresh token");
  }

  const refreshTokenData = {
    refresh_token: refreshToken,
  };

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(refreshTokenData),
  });

  if (!response.ok) {
    throw new Error("Error al refrescar la sesión");
  }

  const tokenData = await response.json();

  sessionStorage.setItem("accessToken", tokenData.access_token);

  return tokenData.access_token;
}
