import {
  getData,
  sendData,
  modifyData,
  deleteData,
  archiveOrRestoreData,
} from "./methods.js";

const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getProjects() {
  return getData(
    `${API_URL}/projects`,
    "No se ha podido obtener los proyectos del servidor. Inténtelo de nuevo más tarde",
  );
}

export async function getArchivedProjects() {
  return getData(
    `${API_URL}/projects/archived`,
    "No se ha podido obtener los proyectos del servidor. Inténtelo de nuevo más tarde",
  );
}

export async function getProjectById(id) {
  return getData(
    `${API_URL}/projects/${id}`,
    "No se ha podido obtener el proyecto con ese id",
  );
}

export async function getProjectByClientId(id) {
  return getData(
    `${API_URL}/projects/client/${id}`,
    "No se ha podido obtener el proyecto con ese id",
  );
}

export async function setProject(project) {
  return sendData(
    `${API_URL}/projects`,
    project,
    "No se ha podido guardar el proyecto. Inténtelo de nuevo.",
  );
}

export async function setFullProject(project) {
  return sendData(
    `${API_URL}/projects/create-completed-project`,
    project,
    "No se ha podido guardar el proyecto. Inténtelo de nuevo.",
  );
}

export async function modifyProject(project, id) {
  return modifyData(
    `${API_URL}/projects/${id}`,
    project,
    "No se ha podido modificar el proyecto.",
  );
}

export async function deleteProjectById(id) {
  return deleteData(
    `${API_URL}/projects/${id}`,
    "No se ha podido borrar el proyecto",
  );
}

export async function archiveProject(id) {
  return archiveOrRestoreData(
    `${API_URL}/projects/${id}/archive`,
    "No se ha podido archivar el proyecto.",
  );
}

export async function restoreProject(id) {
  return archiveOrRestoreData(
    `${API_URL}/projects/${id}/restore`,
    "No se ha podido restaurar el proyecto.",
  );
}
