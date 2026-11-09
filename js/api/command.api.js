import { getData, sendData, modifyData, deleteData } from "./methods.js";
import { API_BASE_URL } from "./config.js";

export async function getCommands() {
  return getData(
    `${API_BASE_URL}/commands`,
    "No se han podido obtener los comandos.",
  );
}

export async function getCommandById(id) {
  return getData(
    `${API_BASE_URL}/commands/${id}`,
    "No se ha podido obtener el comando con ese id.",
  );
}

export async function getCommandsByProjectId(projectId) {
  return getData(
    `${API_BASE_URL}/commands/project/${projectId}`,
    "No se han podido obtener los comandos del proyecto.",
  );
}

export async function setCommand(command) {
  return sendData(
    `${API_BASE_URL}/commands`,
    command,
    "No se ha podido guardar el comando.",
  );
}

export async function modifyCommand(command, id) {
  return modifyData(
    `${API_BASE_URL}/commands/${id}`,
    command,
    "No se ha podido modificar el comando.",
  );
}

export async function deleteCommand(id) {
  return deleteData(
    `${API_BASE_URL}/commands/${id}`,
    "No se ha podido borrar el comando.",
  );
}
