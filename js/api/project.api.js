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

export async function getProjects(entity, limit, offset, search) {
  return getPaginatedData(
    entity,
    limit,
    offset,
    search,
    "No se ha podido obtener los proyectos del servidor. Inténtelo de nuevo más tarde",
  );
}

export async function getLightProjects(entity) {
  return getLightData(
    entity,
    "No se han podido obtener los proyectos del servidor. Inténtelo de nuevo más tarde",
  );
}

export async function getArchivedProjects(limit = 20, offset = 0, search = "") {
  return getPaginatedData(
    "projects/archived",
    limit,
    offset,
    search,
    "No se ha podido obtener los proyectos del servidor. Inténtelo de nuevo más tarde",
  );
}

export async function getFavoriteProjects(limit = 20, offset = 0, search = "") {
  return getPaginatedData(
    "projects/favorites",
    limit,
    offset,
    search,
    "No se han podido obtener los proyectos favoritos.",
  );
}

export async function favoriteProject(projectId) {
  return changeStatus(
    `${API_BASE_URL}/projects/${projectId}/favorite?project_id=${projectId}`,
    "No se ha podido añadir el proyecto a favoritos.",
  );
}

export async function unfavoriteProject(projectId) {
  return changeStatus(
    `${API_BASE_URL}/projects/${projectId}/unfavorite?project_id=${projectId}`,
    "No se ha podido eliminar el proyecto de favoritos.",
  );
}

export async function getProjectById(id) {
  return getData(
    `${API_BASE_URL}/projects/${id}`,
    "No se ha podido obtener el proyecto con ese id",
  );
}

export async function getProjectByClientId(id) {
  return getData(
    `${API_BASE_URL}/projects/client/${id}`,
    "No se ha podido obtener el proyecto con ese id",
  );
}

export async function setProject(project) {
  return sendData(
    `${API_BASE_URL}/projects`,
    project,
    "No se ha podido guardar el proyecto. Inténtelo de nuevo.",
  );
}

export async function setFullProject(project) {
  return sendData(
    `${API_BASE_URL}/projects/create-completed-project`,
    project,
    "No se ha podido guardar el proyecto. Inténtelo de nuevo.",
  );
}

export async function modifyProject(project, id) {
  return modifyData(
    `${API_BASE_URL}/projects/${id}`,
    project,
    "No se ha podido modificar el proyecto.",
  );
}

export async function deleteProjectById(id) {
  return deleteData(
    `${API_BASE_URL}/projects/${id}`,
    "No se ha podido borrar el proyecto",
  );
}

export async function archiveProject(id) {
  return changeStatus(
    `${API_BASE_URL}/projects/${id}/archive`,
    "No se ha podido archivar el proyecto.",
  );
}

export async function restoreProject(id) {
  return changeStatus(
    `${API_BASE_URL}/projects/${id}/restore`,
    "No se ha podido restaurar el proyecto.",
  );
}
