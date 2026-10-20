import { getData, sendData, modifyData, deleteData } from "./methods.js";

const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getNotes() {
  return getData(`${API_URL}/notes`, "No se han podido obtener las notas.");
}

export async function getNoteById(id) {
  return getData(`${API_URL}/notes/${id}`, "No se ha podido obtener la nota con ese id.");
}

export async function getNotesByProjectId(projectId) {
  return getData(`${API_URL}/notes/project/${projectId}`, "No se han podido obtener las notas del proyecto.");
}

export async function setNote(note) {
  return sendData(`${API_URL}/notes`, note, "No se ha podido guardar la nota.");
}

export async function modifyNote(note, id) {
  return modifyData(`${API_URL}/notes/${id}`, note, "No se ha podido modificar la nota.");
}

export async function deleteNote(id) {
  return deleteData(`${API_URL}/notes/${id}`, "No se ha podido borrar la nota.");
}
