import { getData, modifyData } from "./methods.js";
import { API_BASE_URL } from "./config.js";

export async function getProfile() {
  return getData(
    `${API_BASE_URL}/users/me`,
    "No se ha podido acceder a tu perfil.",
  );
}

export async function modifyProfile(profile) {
  return modifyData(
    `${API_BASE_URL}/users/me`,
    profile,
    "No se ha podido actualizar tu perfil",
  );
}

export async function modifyPassword(password) {
  return modifyData(
    `${API_BASE_URL}/users/me/password`,
    password,
    "No se ha podido actualizar tu contraseña",
  );
}
