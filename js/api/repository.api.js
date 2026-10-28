import { getData, sendData, modifyData, deleteData } from "./methods.js";

const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getRepositories() {
  return getData(
    `${API_URL}/repositories`,
    "No se han podido obtener los repositorios.",
  );
}

export async function getRepositoryById(id) {
  return getData(
    `${API_URL}/repositories/${id}`,
    "No se ha podido obtener el repositorio con ese id.",
  );
}

export async function getRepositoriesByProjectId(projectId) {
  return getData(
    `${API_URL}/repositories/project/${projectId}`,
    "No se han podido obtener los repositorios del proyecto.",
  );
}

export async function setRepository(repository) {
  return sendData(
    `${API_URL}/repositories`,
    repository,
    "No se ha podido guardar el repositorio.",
  );
}

export async function modifyRepository(repository, id) {
  return modifyData(
    `${API_URL}/repositories/${id}`,
    repository,
    "No se ha podido modificar el repositorio.",
  );
}

export async function deleteRepository(id) {
  return deleteData(
    `${API_URL}/repositories/${id}`,
    "No se ha podido borrar el repositorio.",
  );
}
