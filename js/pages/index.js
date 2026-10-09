import { checkToken, logout } from "../api/session.js";

checkToken();

const logoutButton = document.querySelector("#logout-button");

logoutButton.addEventListener("click", logout);
