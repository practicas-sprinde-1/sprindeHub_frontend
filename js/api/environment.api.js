import { getData, sendData, modifyData, deleteData } from "./methods.js";

const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getEnvironments() {
  return getData(`${API_URL}/environments`, "No se han podido obtener los entornos.");
}

export async function getEnvironmentById(id) {
  return getData(`${API_URL}/environments/${id}`, "No se ha podido obtener el entorno con ese id.");
}

export async function getEnvironmentsByProjectId(projectId) {
  return getData(`${API_URL}/environments/project/${projectId}`, "No se han podido obtener los entornos del proyecto.");
}

export async function setEnvironment(environment) {
  return sendData(`${API_URL}/environments`, environment, "No se ha podido guardar el entorno.");
}

export async function modifyEnvironment(environment, id) {
  return modifyData(`${API_URL}/environments/${id}`, environment, "No se ha podido modificar el entorno.");
}

export async function deleteEnvironment(id) {
  return deleteData(`${API_URL}/environments/${id}`, "No se ha podido borrar el entorno.");
}
