import {
  getData,
  sendData,
  modifyData,
  deleteData,
  archiveOrRestoreData,
} from "./methods.js";

const API_URL = "http://127.0.0.1:8000/api/v1";

export async function assignUserToClient(client, userId) {
  return sendData(
    `${API_URL}/admin/user-clients/users/${userId}/clients`,
    client,
    "No se ha podido asignar el cliente al usuario elegido.",
  );
}

export async function getAllRelationships() {
  return getData(
    `${API_URL}/admin/user-clients`,
    "No se han podido cargar las relaciones entre usuarios y clientes",
  );
}

export async function revokeClientAccess(userId, clientId) {
  return deleteData(
    `${API_URL}/admin/user-clients/users/${userId}/clients/${clientId}`,
    "No se ha podido revocar el permiso de acceso",
  );
}

export async function getRelationshipByClient(clientId) {
  return getData(
    `${API_URL}/admin/user-clients/clients/${clientId}/users`,
    "No se han podido cargar las relaciones del cliente",
  );
}

export async function getRelationshipByUser(userId) {
  return getData(
    `${API_URL}/admin/user-clients/${userId}`,
    "No se han podido cargar las relaciones del usuario",
  );
}
