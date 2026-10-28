import { getData, sendData, modifyData, deleteData } from "./methods.js";

const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getLinks() {
  return getData(`${API_URL}/links`, "No se han podido obtener los enlaces.");
}

export async function getLinkById(id) {
  return getData(`${API_URL}/links/${id}`, "No se ha podido obtener el enlace con ese id.");
}

export async function getLinksByProjectId(projectId) {
  return getData(`${API_URL}/links/project/${projectId}`, "No se han podido obtener los enlaces del proyecto.");
}

export async function setLink(link) {
  return sendData(`${API_URL}/links`, link, "No se ha podido guardar el enlace.");
}

export async function modifyLink(link, id) {
  return modifyData(`${API_URL}/links/${id}`, link, "No se ha podido modificar el enlace.");
}

export async function deleteLink(id) {
  return deleteData(`${API_URL}/links/${id}`, "No se ha podido borrar el enlace.");
}
