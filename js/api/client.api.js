import {
  getData,
  sendData,
  modifyData,
  deleteData,
  changeStatus,
  getLightData,
  getPaginatedData,
} from "./methods.js";
import { API_BASE_URL } from "./config.js";

export async function getClients(entity, limit, offset, search) {
  return getPaginatedData(
    entity,
    limit,
    offset,
    search,
    "No se ha podido obtener los clientes del servidor. Inténtelo de nuevo más tarde",
  );
}

export async function getLightClients(entity) {
  return getLightData(
    entity,
    "No se han podido obtener los clientes del servidor. Inténtelo de nuevo más tarde",
  );
}

export async function getArchivedClients(limit, offset, search) {
  return getPaginatedData(
    "clients/archived",
    limit,
    offset,
    search,
    "No se ha podido obtener los clientes del servidor. Inténtelo de nuevo más tarde",
  );
}

export async function getFavoriteClients(limit = 20, offset = 0, search = "") {
  return getPaginatedData(
    "clients/favorites",
    limit,
    offset,
    search,
    "No se han podido obtener los clientes favoritos.",
  );
}

export async function favoriteClient(clientId) {
  return changeStatus(
    `${API_BASE_URL}/clients/${clientId}/favorite?client_id=${clientId}`,
    "No se ha podido añadir el cliente a favoritos.",
  );
}

export async function unfavoriteClient(clientId) {
  return changeStatus(
    `${API_BASE_URL}/clients/${clientId}/unfavorite?client_id=${clientId}`,
    "No se ha podido eliminar el cliente de favoritos.",
  );
}

export async function getClientById(id) {
  return getData(
    `${API_BASE_URL}/clients/${id}`,
    "No se ha podido obtener el cliente con ese id",
  );
}

export async function setClient(client) {
  return sendData(
    `${API_BASE_URL}/clients`,
    client,
    "No se ha podido guardar el cliente. Inténtelo de nuevo.",
  );
}

export async function modifyClient(client, id) {
  return modifyData(
    `${API_BASE_URL}/clients/${id}`,
    client,
    "No se ha podido modificar el cliente.",
  );
}

export async function deleteClientById(id) {
  return deleteData(
    `${API_BASE_URL}/clients/${id}`,
    "No se ha podido borrar el cliente",
  );
}

export async function archiveClient(id) {
  return changeStatus(
    `${API_BASE_URL}/clients/${id}/archive`,

    "No se ha podido archivar el cliente.",
  );
}

export async function restoreClient(id) {
  return changeStatus(
    `${API_BASE_URL}/clients/${id}/restore`,
    "No se ha podido restaurar el cliente.",
  );
}
