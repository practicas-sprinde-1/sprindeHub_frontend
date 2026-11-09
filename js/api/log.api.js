import { getData, getAdminData } from "./methods.js";
import { API_BASE_URL } from "./config.js";

export async function getLogs(entity, limit, offset, search) {
  return getAdminData(
    entity,
    limit,
    offset,
    search,
    "No se han podido cargar los registros",
  );
}

export async function getLogsByUser(userId) {
  return getData(
    `${API_BASE_URL}/admin/logs/users/${userId}`,
    "No se han podido cargar los registros del usuario seleccionado",
  );
}

export async function getLogsByEntity(type, id) {
  return getData(
    `${API_BASE_URL}/admin/logs/entities/${type}/${id}`,
    "No se han podido cargar los registros de esta entidad",
  );
}
