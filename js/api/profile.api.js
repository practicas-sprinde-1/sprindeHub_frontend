import {
  getData,
  sendData,
  modifyData,
  deleteData,
  archiveOrRestoreData,
} from "./methods.js";

const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getProfile() {
  return getData(`${API_URL}/users/me`, "No se ha podido acceder a tu perfil.");
}

export async function modifyProfile(profile) {
  return modifyData(
    `${API_URL}/users/me`,
    profile,
    "No se ha podido actualizar tu perfil",
  );
}

export async function modifyPassword(password) {
  return modifyData(
    `${API_URL}/users/me/password`,
    password,
    "No se ha podido actualizar tu contraseña",
  );
}
