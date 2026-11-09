import { API_BASE_URL } from "./config.js";

export async function login(credentials) {
  return sendCredentials(
    `${API_BASE_URL}/auth/login`,
    credentials,
    "No se ha podido iniciar sesión.",
  );
}

export async function register(credentials) {
  return sendCredentials(
    `${API_BASE_URL}/auth/register`,
    credentials,
    "No se ha podido completar el registro.",
  );
}

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
    `${API_BASE_URL}/auth/refresh`,
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
  } catch {
    throw new Error("No se ha podido conectar con el servidor.");
  }
}

async function getResponseError(response, defaultMessage) {
  const data = await getJsonData(response);

  let message = defaultMessage;

  if (data && data.detail) {
    message = JSON.stringify(data.detail);

    if (data.detail.message) {
      message = data.detail.message;
    }
  }

  const responseError = new Error(message);
  responseError.statusCode = null;

  if (data) {
    responseError.statusCode = data.status_code;
  }

  responseError.status = response.status;
  return responseError;
}

async function getJsonData(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
