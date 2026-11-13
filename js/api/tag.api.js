import {
  getData,
  getPaginatedData,
  sendData,
  modifyData,
  deleteData,
} from "./methods.js";
import { API_BASE_URL } from "./config.js";

export async function getTags(limit = 20, offset = 0, search = "") {
  return getPaginatedData(
    "tags",
    limit,
    offset,
    search,
    "No se han podido obtener los dispositivos.",
  );
}

export async function getTagsByClientId(clientId, limit = 20, offset = 0) {
  return getPaginatedData(
    `tags/client/${clientId}`,
    limit,
    offset,
    "",
    "No se han podido obtener los dispositivos del cliente.",
  );
}

export async function getTagById(id) {
  return getData(
    `${API_BASE_URL}/tags/${id}`,
    "No se ha podido obtener el dispositivo con ese id.",
  );
}

export async function setTag(tag) {
  return sendData(
    `${API_BASE_URL}/tags`,
    tag,
    "No se ha podido guardar el dispositivo.",
  );
}

export async function modifyTag(tag, id) {
  return modifyData(
    `${API_BASE_URL}/tags/${id}`,
    tag,
    "No se ha podido modificar el dispositivo.",
  );
}

export async function deleteTag(id) {
  return deleteData(
    `${API_BASE_URL}/tags/${id}`,
    "No se ha podido borrar el dispositivo.",
  );
}
