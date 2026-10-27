import {
  getData,
  sendData,
  modifyData,
  deleteData,
  archiveOrRestoreData,
  getAdminData,
} from "./methods.js";

const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getLogs(entity, limit, offset) {
  return getAdminData(
    entity,
    limit,
    offset,
    "No se han podido cargar los registros",
  );
}

export async function getLogsByUser(userId) {
  return getData(
    `${API_URL}/admin/logs/users/${userId}`,
    "No se han podido cargar los registros del usuario seleccionado",
  );
}

export async function getLogsByEntity(type, id) {
  return getData(
    `${API_URL}/admin/logs/entities/${type}/${id}`,
    "No se han podido cargar los registros de esta entidad",
  );
}
