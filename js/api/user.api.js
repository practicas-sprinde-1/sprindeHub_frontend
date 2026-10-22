import {
  getData,
  sendData,
  modifyData,
  deleteData,
  archiveOrRestoreData,
} from "./methods.js";

const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getUsers() {
  return getData(
    `${API_URL}/admin/users`,
    "No se han podido cargar los usuarios",
  );
}

export async function setUser(user) {
  return sendData(
    `${API_URL}/admin/users`,
    user,
    "No se ha podido crear el usuario",
  );
}

export async function modifyUser(user, id) {
  return modifyData(
    `${API_URL}/admin/users/${id}`,
    user,
    "No se ha podido modificar el usuario",
  );
}

export async function deleteUser(id) {
  return deleteData(
    `${API_URL}/admin/users/${id}`,
    "No se ha podido eliminar el usuario",
  );
}
