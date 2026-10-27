import {
  getData,
  sendData,
  modifyData,
  deleteData,
  archiveOrRestoreData,
  getLightData,
  getPaginatedData,
} from "./methods.js";

const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getClients(entity, limit, offset) {
  return getPaginatedData(
    entity,
    limit,
    offset,
    "No se ha podido obtener los clientes del servidor. Inténtelo de nuevo más tarde",
  );
}

export async function getLightClients(entity) {
  return getLightData(
    entity,
    "No se han podido obtener los clientes del servidor. Inténtelo de nuevo más tarde",
  );
}

export async function getArchivedClients() {
  return getData(
    `${API_URL}/clients/archived`,
    "No se ha podido obtener los clientes del servidor. Inténtelo de nuevo más tarde",
  );
}

export async function getClientById(id) {
  return getData(
    `${API_URL}/clients/${id}`,
    "No se ha podido obtener el cliente con ese id",
  );
}

export async function setClient(client) {
  return sendData(
    `${API_URL}/clients`,
    client,
    "No se ha podido guardar el cliente. Inténtelo de nuevo.",
  );
}

export async function modifyClient(client, id) {
  return modifyData(
    `${API_URL}/clients/${id}`,
    client,
    "No se ha podido modificar el cliente.",
  );
}

export async function deleteClientById(id) {
  return deleteData(
    `${API_URL}/clients/${id}`,
    "No se ha podido borrar el cliente",
  );
}

export async function archiveClient(id) {
  return archiveOrRestoreData(
    `${API_URL}/clients/${id}/archive`,

    "No se ha podido archivar el cliente.",
  );
}

export async function restoreClient(id) {
  return archiveOrRestoreData(
    `${API_URL}/clients/${id}/restore`,
    "No se ha podido restaurar el cliente.",
  );
}
