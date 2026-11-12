import { getData, getAdminData } from "./methods.js";
import { API_BASE_URL } from "./config.js";

export async function getLogsPage(limit, offset, search, filters = {}) {
  return getAdminData(
    "logs/page",
    limit,
    offset,
    search,
    "No se han podido cargar los registros",
    {
      start_date: filters.startDate,
      end_date: filters.endDate,
      action: filters.actionType,
      username: filters.user,
      affected_entity: filters.entityType,
    },
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
