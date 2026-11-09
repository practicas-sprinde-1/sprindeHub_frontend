import { getData, sendData, modifyData, deleteData } from "./methods.js";
import { API_BASE_URL } from "./config.js";

export async function getDomains() {
  return getData(`${API_BASE_URL}/domains`, "No se han podido obtener los dominios.");
}

export async function getDomainById(id) {
  return getData(`${API_BASE_URL}/domains/${id}`, "No se ha podido obtener el dominio con ese id.");
}

export async function getDomainsByProjectId(projectId) {
  return getData(`${API_BASE_URL}/domains/project/${projectId}`, "No se han podido obtener los dominios del proyecto.");
}

export async function setDomain(domain) {
  return sendData(`${API_BASE_URL}/domains`, domain, "No se ha podido guardar el dominio.");
}

export async function modifyDomain(domain, id) {
  return modifyData(`${API_BASE_URL}/domains/${id}`, domain, "No se ha podido modificar el dominio.");
}

export async function deleteDomain(id) {
  return deleteData(`${API_BASE_URL}/domains/${id}`, "No se ha podido borrar el dominio.");
}
