import { sendData, modifyData, deleteData, getAdminData } from "./methods.js";
import { API_BASE_URL } from "./config.js";

export async function getUsers(entity, limit, offset, search) {
  return getAdminData(
    entity,
    limit,
    offset,
    search,
    "No se han podido cargar los usuarios",
  );
}

export async function setUser(user) {
  return sendData(
    `${API_BASE_URL}/admin/users`,
    user,
    "No se ha podido crear el usuario",
  );
}

export async function modifyUser(user, id) {
  return modifyData(
    `${API_BASE_URL}/admin/users/${id}`,
    user,
    "No se ha podido modificar el usuario",
  );
}

export async function deleteUser(id) {
  return deleteData(
    `${API_BASE_URL}/admin/users/${id}`,
    "No se ha podido eliminar el usuario",
  );
}
