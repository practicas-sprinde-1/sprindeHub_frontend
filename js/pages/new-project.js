import { createHeader } from "../components/header.js";

const headerContainer = document.querySelector("#header-container");

headerContainer.append(createHeader("César", "./profile.html"));
