import { refreshAccessToken } from "./auth.api.js";
import { API_BASE_URL } from "./config.js";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const ACCEPT_JSON_HEADERS = {
  Accept: "application/json",
};

const FORBIDDEN_ERROR_MESSAGE = "No has podido acceder a estos archivos";
const EXPIRED_SESSION_ERROR_MESSAGE = "La sesión ha caducado";
const LOGIN_URL = "/pages/login.html";

export async function getData(url, errorMessage) {
  return getJson(url, errorMessage);
}

export async function getPaginatedData(
  entity,
  limit,
  offset,
  search,
  errorMessage,
) {
  const query = buildPaginationQuery(limit, offset, search);
  return getJson(`${API_BASE_URL}/${entity}?${query}`, errorMessage);
}

export async function getLightData(entity, errorMessage) {
  return getData(`${API_BASE_URL}/${entity}/light`, errorMessage);
}

export async function getAdminData(
  entity,
  limit,
  offset,
  search,
  errorMessage,
  filters,
) {
  const query = buildPaginationQuery(limit, offset, search, filters);
  return getJson(`${API_BASE_URL}/admin/${entity}?${query}`, errorMessage);
}

export async function sendData(url, data, errorMessage) {
  return sendJson(url, "POST", data, errorMessage);
}

export async function modifyData(url, data, errorMessage) {
  return sendJson(url, "PATCH", data, errorMessage);
}

export async function deleteData(url, errorMessage) {
  const response = await requestWithToken(url, {
    method: "DELETE",
    headers: ACCEPT_JSON_HEADERS,
  });

  await checkResponse(response, errorMessage);

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function changeStatus(url, errorMessage) {
  const response = await requestWithToken(url, {
    method: "PATCH",
    headers: ACCEPT_JSON_HEADERS,
  });

  await checkResponse(response, errorMessage);

  return response.json();
}

function buildPaginationQuery(limit, offset, search, filters) {
  const query = new URLSearchParams();

  query.set("limit", String(limit));
  query.set("offset", String(offset));

  if (search !== null && search !== undefined && search !== "") {
    query.set("search", search);
  }

  if (filters !== null && filters !== undefined) {
    for (const key in filters) {
      const value = filters[key];

      if (value !== null && value !== undefined && value !== "") {
        query.set(key, value);
      }
    }
  }

  return query;
}

async function getJson(url, errorMessage) {
  const response = await requestWithToken(url, {
    method: "GET",
    headers: ACCEPT_JSON_HEADERS,
  });

  if (response.status === 403) {
    throw new Error(FORBIDDEN_ERROR_MESSAGE);
  }

  await checkResponse(response, errorMessage);
  return response.json();
}

async function sendJson(url, method, data, errorMessage) {
  const response = await requestWithToken(url, {
    method,
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });

  await checkResponse(response, errorMessage);
  return response.json();
}

async function checkResponse(response, errorMessage) {
  if (!response.ok) {
    throw await getResponseError(response, errorMessage);
  }
}

async function requestWithToken(url, options) {
  let response = await makeRequest(url, options);

  if (response.status !== 401) {
    return response;
  }

  try {
    await refreshAccessToken();
    response = await makeRequest(url, options);
  } catch {
    expireSession();
  }

  if (response.status === 401) {
    expireSession();
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

export function expireSession() {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  window.location.replace(LOGIN_URL);
  throw new Error(EXPIRED_SESSION_ERROR_MESSAGE);
}

async function getResponseError(response, defaultMessage) {
  const data = await getJsonData(response);

  const message = getErrorMessage(data?.detail, defaultMessage);

  const responseError = new Error(message);
  responseError.code = data?.code;
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

function getErrorMessage(detail, defaultMessage) {
  if (!detail) {
    return defaultMessage;
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (detail.message) {
    return detail.message;
  }

  if (detail.msg) {
    return detail.msg;
  }

  if (Array.isArray(detail)) {
    return translateErrorMessage(detail[0]?.msg) || defaultMessage;
  }

  return JSON.stringify(detail);
}

function translateErrorMessage(msg) {
  const translations = {
    "String should match pattern '^https?://'": "Debe empezar por http://",
    "String should have at least 1 character": "El campo no debe estar vacío",
    "value is not a valid email address: An email address must have an @-sign.":
      "Introduce un e-mail válido",
    "String should have at least 10 characters":
      "La contraseña debe tener al menos 10 caracteres",
  };

  return translations[msg] || "Ha ocurrido un error inesperado";
}
