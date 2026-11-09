import { getData, sendData, deleteData } from "./methods.js";
import { API_BASE_URL } from "./config.js";

export async function assignUserToClient(client, userId) {
  return sendData(
    `${API_BASE_URL}/admin/user-clients/users/${userId}/clients`,
    client,
    "No se ha podido asignar el cliente al usuario elegido.",
  );
}

export async function getAllRelationships() {
  return getData(
    `${API_BASE_URL}/admin/user-clients`,
    "No se han podido cargar las relaciones entre usuarios y clientes",
  );
}

export async function revokeClientAccess(userId, clientId) {
  return deleteData(
    `${API_BASE_URL}/admin/user-clients/users/${userId}/clients/${clientId}`,
    "No se ha podido revocar el permiso de acceso",
  );
}

export async function getRelationshipByClient(clientId) {
  return getData(
    `${API_BASE_URL}/admin/user-clients/clients/${clientId}/users`,
    "No se han podido cargar las relaciones del cliente",
  );
}

export async function getRelationshipByUser(userId) {
  return getData(
    `${API_BASE_URL}/admin/user-clients/${userId}`,
    "No se han podido cargar las relaciones del usuario",
  );
}
