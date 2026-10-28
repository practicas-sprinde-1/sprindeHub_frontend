import { getData, sendData, modifyData, deleteData } from "./methods.js";

const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getDomains() {
  return getData(`${API_URL}/domains`, "No se han podido obtener los dominios.");
}

export async function getDomainById(id) {
  return getData(`${API_URL}/domains/${id}`, "No se ha podido obtener el dominio con ese id.");
}

export async function getDomainsByProjectId(projectId) {
  return getData(`${API_URL}/domains/project/${projectId}`, "No se han podido obtener los dominios del proyecto.");
}

export async function setDomain(domain) {
  return sendData(`${API_URL}/domains`, domain, "No se ha podido guardar el dominio.");
}

export async function modifyDomain(domain, id) {
  return modifyData(`${API_URL}/domains/${id}`, domain, "No se ha podido modificar el dominio.");
}

export async function deleteDomain(id) {
  return deleteData(`${API_URL}/domains/${id}`, "No se ha podido borrar el dominio.");
}
