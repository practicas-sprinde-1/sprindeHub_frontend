import { getData, sendData, modifyData, deleteData } from "./methods.js";
import { API_BASE_URL } from "./config.js";

export async function getRepositories() {
  return getData(
    `${API_BASE_URL}/repositories`,
    "No se han podido obtener los repositorios.",
  );
}

export async function getRepositoryById(id) {
  return getData(
    `${API_BASE_URL}/repositories/${id}`,
    "No se ha podido obtener el repositorio con ese id.",
  );
}

export async function getRepositoriesByProjectId(projectId) {
  return getData(
    `${API_BASE_URL}/repositories/project/${projectId}`,
    "No se han podido obtener los repositorios del proyecto.",
  );
}

export async function setRepository(repository) {
  return sendData(
    `${API_BASE_URL}/repositories`,
    repository,
    "No se ha podido guardar el repositorio.",
  );
}

export async function modifyRepository(repository, id) {
  return modifyData(
    `${API_BASE_URL}/repositories/${id}`,
    repository,
    "No se ha podido modificar el repositorio.",
  );
}

export async function deleteRepository(id) {
  return deleteData(
    `${API_BASE_URL}/repositories/${id}`,
    "No se ha podido borrar el repositorio.",
  );
}
