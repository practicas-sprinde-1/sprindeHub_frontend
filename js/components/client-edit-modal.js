import { modifyClient } from "../api/client.api.js";
import { getProfile } from "../api/profile.api.js";
import { getLightProjects, modifyProject } from "../api/project.api.js";
import {
  getRelationshipByUser,
  revokeClientAccess,
} from "../api/user_client.api.js";

export async function createEditModalClient(
  client,
  onSave,
  assignedProjects = [],
) {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const modal = document.createElement("section");
  modal.classList.add("client-edit-modal");

  const title = document.createElement("h1");
  title.textContent = `Editando cliente: ${client.name}`;
  title.classList.add("modal-title");

  const closeButton = document.createElement("button");
  closeButton.classList.add("modal-close-button");
  closeButton.type = "button";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Cerrar");

  closeButton.addEventListener("click", () => {
    overlay.remove();
  });

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.name = "name";
  nameInput.value = client.name;

  const cifInput = document.createElement("input");
  cifInput.type = "text";
  cifInput.name = "cif";
  cifInput.value = client.cif;

  const phoneInput = document.createElement("input");
  phoneInput.type = "tel";
  phoneInput.name = "phone";
  phoneInput.value = client.phone;

  const statusInput = document.createElement("select");
  statusInput.name = "is_active";

  const activeOption = document.createElement("option");
  activeOption.value = "true";
  activeOption.textContent = "Activo";

  const inactiveOption = document.createElement("option");
  inactiveOption.value = "false";
  inactiveOption.textContent = "Inactivo";

  statusInput.append(activeOption, inactiveOption);
  statusInput.value = String(client.is_active);

  const nameField = createClientField("Nombre", nameInput);
  const cifField = createClientField("CIF", cifInput);
  const phoneField = createClientField("Teléfono", phoneInput);
  const statusField = createClientField("Estado", statusInput);

  const projects = await getLightProjects("projects");

  const initialProjectsId = assignedProjects.map((project) => project.id);

  const projectCheckBoxList = createProjectCheckBoxList(
    projects,
    initialProjectsId,
  );

  const user = await getProfile();

  const userName = user.username;

  const userRelationship = await getRelationshipByUser(user.id);

  const userRelationshipClientsId = userRelationship.map((r) => r.client_id);

  const individualRelationshipClientId = userRelationshipClientsId.filter(
    (id) => id === client.id,
  );

  const userCheckBoxList = createUserCheckBoxList(
    userName,
    individualRelationshipClientId,
  );

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");

  saveButton.addEventListener("click", async () => {
    client.name = nameInput.value.trim();
    client.cif = cifInput.value.trim();
    client.phone = phoneInput.value.trim();
    client.is_active = statusInput.value === "true";

    await modifyClient(client, client.id);

    const selectedProjectsIds = projectCheckBoxList.getSelectedProjectsId();

    const addedProjectsid = selectedProjectsIds.filter((projectId) => {
      return !initialProjectsId.includes(projectId);
    });

    const addedProjects = projects.filter((project) => {
      return addedProjectsid.includes(project.id);
    });

    const removeProjectsIds = initialProjectsId.filter((projectId) => {
      return !selectedProjectsIds.includes(projectId);
    });

    const removeProjects = projects.filter((project) => {
      return removeProjectsIds.includes(project.id);
    });

    for (const project of addedProjects) {
      const updatedProject = {
        client_id: client.id,
      };
      await modifyProject(updatedProject, project.id);
    }

    for (const project of removeProjects) {
      const updatedProject = {
        client_id: null,
      };
      await modifyProject(updatedProject, project.id);
    }

    const hadAccess = individualRelationshipClientId.length > 0;
    const hasAccess = userCheckBoxList.getState();

    if (hadAccess && !hasAccess) {
      await revokeClientAccess(user.id, client.id);
    }

    await onSave(client);
    overlay.remove();
  });

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancelar";
  cancelButton.classList.add("modal-cancel-button");

  cancelButton.addEventListener("click", () => {
    overlay.remove();
  });

  const modalActions = document.createElement("div");
  modalActions.classList.add("modal-actions");
  modalActions.append(saveButton, cancelButton);

  if (individualRelationshipClientId.length <= 0) {
    modal.append(
      closeButton,
      title,
      nameField,
      cifField,
      phoneField,
      statusField,
      projectCheckBoxList.element,
      modalActions,
    );
  } else {
    modal.append(
      closeButton,
      title,
      nameField,
      cifField,
      phoneField,
      statusField,
      userCheckBoxList.element,
      projectCheckBoxList.element,
      modalActions,
    );
  }

  overlay.append(modal);
  return overlay;
}

function createClientField(labelText, input) {
  const field = document.createElement("div");
  field.classList.add("client-edit-field");

  const label = document.createElement("label");
  label.textContent = labelText;
  label.htmlFor = input.name;
  input.id = input.name;

  field.append(label, input);
  return field;
}

function createProjectCheckBoxList(projects, initialProjectsIds) {
  const section = document.createElement("section");
  const title = document.createElement("h2");
  title.textContent = "Proyectos";

  const list = document.createElement("ul");

  let selectedProjectsIds = [...initialProjectsIds];

  const assignedProjects = projects.filter((project) => {
    return initialProjectsIds.includes(project.id);
  });

  const unassignedProjects = projects.filter((project) => {
    return !initialProjectsIds.includes(project.id);
  });

  const orderedProjects = [...assignedProjects, ...unassignedProjects];

  orderedProjects.forEach((project) => {
    const listItem = document.createElement("li");
    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const projectName = document.createElement("span");
    projectName.textContent = project.name;

    checkbox.checked = initialProjectsIds.includes(project.id);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        const selected = selectedProjectsIds.includes(project.id);

        if (!selected) {
          selectedProjectsIds.push(project.id);
        }
        return;
      }

      selectedProjectsIds = selectedProjectsIds.filter((projectId) => {
        return projectId !== project.id;
      });
    });

    label.append(checkbox, projectName);
    listItem.append(label);
    list.append(listItem);
  });

  section.append(title, list);

  return {
    element: section,
    getSelectedProjectsId: () => {
      return selectedProjectsIds;
    },
  };
}

function createUserCheckBoxList(userName, relationship) {
  const section = document.createElement("section");
  section.classList.add("client-user-access");
  const title = document.createElement("h2");
  title.textContent = "Usuarios";

  const label = document.createElement("label");
  label.classList.add("client-user-access-option");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const spanUserName = document.createElement("span");
  spanUserName.textContent = userName;

  let state;
  if (relationship.length > 0) {
    state = true;
  } else {
    state = false;
  }

  checkbox.checked = state;

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      state = true;
    } else {
      state = false;
    }
  });

  label.append(checkbox, spanUserName);

  section.append(title, label);

  return {
    element: section,
    getState: () => {
      return state;
    },
  };
}
