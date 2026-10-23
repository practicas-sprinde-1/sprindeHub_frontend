import { refreshAccessToken } from "./auth.api.js";

//Solicita datos al endpoint indicado
export async function getData(url, errorMessage) {
  const response = await requestWithToken(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status == 403) {
    throw new Error("No has podido acceder a estos archivos");
  }

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

//Envía los datos del cliente al endpoint indicado
export async function sendData(url, data, errorMessage) {
  const response = await requestWithToken(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

//Envía los datos modificados del cliente al endpoint indicado
export async function modifyData(url, data, errorMessage) {
  const response = await requestWithToken(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

//Envía los datos modificados del cliente al endpoint indicado
export async function deleteData(url, errorMessage) {
  const response = await requestWithToken(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

//Envía los datos modificados del cliente al endpoint indicado
export async function archiveOrRestoreData(url, errorMessage) {
  const response = await requestWithToken(url, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

//Metodo auxiliar para comprobar el token y hacer un refresh en la API

async function requestWithToken(url, options) {
  let response = await makeRequest(url, options);

  if (response.status === 401) {
    try {
      await refreshAccessToken();
      response = await makeRequest(url, options);
    } catch (error) {
      clearSessionAndRedirect();
      throw new Error("La sesión ha caducado");
    }
  }

  //Verifica de nuevo la petición después de probar el metodo refreshAccessToken();

  if (response.status === 401) {
    clearSessionAndRedirect();
    throw new Error("La sesión ha caducado");
  }

  return response;
}

async function makeRequest(url, options) {
  const accessToken = sessionStorage.getItem("accessToken");
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

function clearSessionAndRedirect() {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");

  window.location.replace("/pages/login.html");
}
