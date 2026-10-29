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
  const response = await sendRequest(url, credentials);

  if (!response.ok) {
    throw await getResponseError(response, errorMessage);
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

  const response = await sendRequest(
    `${API_URL}/auth/refresh`,
    refreshTokenData,
  );

  if (!response.ok) {
    throw await getResponseError(response, "Error al refrescar la sesión");
  }

  const tokenData = await response.json();

  sessionStorage.setItem("accessToken", tokenData.access_token);

  return tokenData.access_token;
}

async function sendRequest(url, data) {
  try {
    return await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw new Error("No se ha podido conectar con el servidor.");
  }
}

async function getResponseError(response, defaultMessage) {
  let data;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  let message = defaultMessage;

  if (data && data.detail) {
    message = JSON.stringify(data.detail);

    if (data.detail.message) {
      message = data.detail.message;
    }
  }

  const newError = new Error(message);
  newError.statusCode = null;

  if (data) {
    newError.statusCode = data.status_code;
  }

  newError.status = response.status;
  return newError;
}
