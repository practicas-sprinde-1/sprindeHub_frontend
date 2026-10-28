import { getData, sendData, modifyData, deleteData } from "./methods.js";

const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getServices() {
  return getData(`${API_URL}/services`, "No se han podido obtener los servicios.");
}

export async function getServiceById(id) {
  return getData(`${API_URL}/services/${id}`, "No se ha podido obtener el servicio con ese id.");
}

export async function getServicesByProjectId(projectId) {
  return getData(`${API_URL}/services/project/${projectId}`, "No se han podido obtener los servicios del proyecto.");
}

export async function setService(service) {
  return sendData(`${API_URL}/services`, service, "No se ha podido guardar el servicio.");
}

export async function modifyService(service, id) {
  return modifyData(`${API_URL}/services/${id}`, service, "No se ha podido modificar el servicio.");
}

export async function deleteService(id) {
  return deleteData(`${API_URL}/services/${id}`, "No se ha podido borrar el servicio.");
}
