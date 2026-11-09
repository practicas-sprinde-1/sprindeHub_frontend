import { getData, sendData, modifyData, deleteData } from "./methods.js";
import { API_BASE_URL } from "./config.js";

export async function getServices() {
  return getData(`${API_BASE_URL}/services`, "No se han podido obtener los servicios.");
}

export async function getServiceById(id) {
  return getData(`${API_BASE_URL}/services/${id}`, "No se ha podido obtener el servicio con ese id.");
}

export async function getServicesByProjectId(projectId) {
  return getData(`${API_BASE_URL}/services/project/${projectId}`, "No se han podido obtener los servicios del proyecto.");
}

export async function setService(service) {
  return sendData(`${API_BASE_URL}/services`, service, "No se ha podido guardar el servicio.");
}

export async function modifyService(service, id) {
  return modifyData(`${API_BASE_URL}/services/${id}`, service, "No se ha podido modificar el servicio.");
}

export async function deleteService(id) {
  return deleteData(`${API_BASE_URL}/services/${id}`, "No se ha podido borrar el servicio.");
}
