import { modifyClient } from "../api/client.api.js";
import { getProfile } from "../api/profile.api.js";
import { getLightProjects, modifyProject } from "../api/project.api.js";
import {
  getRelationshipByUser,
  revokeClientAccess,
} from "../api/user_client.api.js";
import { showNotification } from "./notifications.js";

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

  closeButton.addEventListener("click", () => {
    overlay.remove();
  });

  const { fields, inputs } = createClientForm(client);

  const projects = await getLightProjects("projects");

  const initialProjectIds = assignedProjects.map((project) => project.id);

  const projectSelection = createProjectSelection(
    projects,
    initialProjectIds,
  );

  const user = await getProfile();

  const userRelationships = await getRelationshipByUser(user.id);
  const hadAccess = userRelationships.some(
    (relationship) => relationship.client_id === client.id,
  );
  const userAccessControl = createUserAccessControl(user.username, hadAccess);

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Guardar";
  saveButton.classList.add("modal-save-button");

  saveButton.addEventListener("click", async () => {
    try {
      updateClientFromInputs(client, inputs);
      await modifyClient(client, client.id);

      await updateProjectAssignments(
        projects,
        initialProjectIds,
        projectSelection.getSelectedProjectIds(),
        client.id,
      );
      await revokeAccessIfDeselected(
        user.id,
        client.id,
        hadAccess,
        userAccessControl,
      );

      await onSave(client);
      overlay.remove();
      showNotification({
        type: "success",
        title: "Cliente modificado",
        message: "Los cambios se han guardado correctamente.",
      });
    } catch (error) {
      showNotification({
        type: "error",
        title: "No se ha podido modificar el cliente",
        message: error.message,
        duration: 7000,
      });
    }
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

  modal.append(closeButton, title, ...fields);
  if (hadAccess) {
    modal.append(userAccessControl.element);
  }
  modal.append(projectSelection.element, modalActions);

  overlay.append(modal);
  return overlay;
}

function createClientForm(client) {
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

  return {
    fields: [
      createClientField("Nombre", nameInput),
      createClientField("CIF", cifInput),
      createClientField("Teléfono", phoneInput),
      createClientStatusField(statusInput),
    ],
    inputs: { nameInput, cifInput, phoneInput, statusInput },
  };
}

function updateClientFromInputs(
  client,
  { nameInput, cifInput, phoneInput, statusInput },
) {
  client.name = nameInput.value.trim();
  client.cif = cifInput.value.trim();
  client.phone = phoneInput.value.trim();
  client.is_active = statusInput.value === "true";
}

async function updateProjectAssignments(
  projects,
  initialProjectIds,
  selectedProjectIds,
  clientId,
) {
  const addedProjectIds = selectedProjectIds.filter(
    (projectId) => !initialProjectIds.includes(projectId),
  );
  const addedProjects = projects.filter((project) =>
    addedProjectIds.includes(project.id),
  );
  const removedProjectIds = initialProjectIds.filter(
    (projectId) => !selectedProjectIds.includes(projectId),
  );
  const removedProjects = projects.filter((project) =>
    removedProjectIds.includes(project.id),
  );

  for (const project of addedProjects) {
    await modifyProject({ client_id: clientId }, project.id);
  }
  for (const project of removedProjects) {
    await modifyProject({ client_id: null }, project.id);
  }
}

async function revokeAccessIfDeselected(
  userId,
  clientId,
  hadAccess,
  userAccessControl,
) {
  const hasAccess = userAccessControl.getState();
  if (!hadAccess || hasAccess) return;

  await revokeClientAccess(userId, clientId);
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

function createClientStatusField(statusInput) {
  const field = document.createElement("div");
  field.classList.add("client-edit-field");

  const label = document.createElement("label");
  label.textContent = "Estado";
  label.htmlFor = statusInput.name;
  statusInput.id = statusInput.name;

  const control = document.createElement("div");
  control.classList.add("client-status-control");

  const indicator = document.createElement("span");
  indicator.classList.add("client-status-indicator");

  const updateIndicator = () => {
    const isActive = statusInput.value === "true";
    indicator.classList.toggle("client-status-indicator--active", isActive);
    indicator.classList.toggle("client-status-indicator--inactive", !isActive);
  };

  statusInput.addEventListener("change", updateIndicator);
  updateIndicator();

  control.append(indicator, statusInput);
  field.append(label, control);
  return field;
}

function createProjectSelection(projects, initialProjectIds) {
  const section = document.createElement("section");
  const title = document.createElement("h2");
  title.textContent = "Proyectos";

  const list = document.createElement("ul");

  let selectedProjectIds = [...initialProjectIds];

  const assignedProjects = projects.filter((project) => {
    return initialProjectIds.includes(project.id);
  });

  const unassignedProjects = projects.filter((project) => {
    return !initialProjectIds.includes(project.id);
  });

  const orderedProjects = [...assignedProjects, ...unassignedProjects];

  orderedProjects.forEach((project) => {
    const listItem = document.createElement("li");
    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const projectName = document.createElement("span");
    projectName.textContent = project.name;

    checkbox.checked = initialProjectIds.includes(project.id);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        const isAlreadySelected = selectedProjectIds.includes(project.id);

        if (!isAlreadySelected) {
          selectedProjectIds.push(project.id);
        }
        return;
      }

      selectedProjectIds = selectedProjectIds.filter((projectId) => {
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
    getSelectedProjectIds: () => {
      return selectedProjectIds;
    },
  };
}

function createUserAccessControl(userName, hasAccess) {
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

  let isAccessSelected = hasAccess;
  checkbox.checked = isAccessSelected;

  checkbox.addEventListener("change", () => {
    isAccessSelected = checkbox.checked;
  });

  label.append(checkbox, spanUserName);

  section.append(title, label);

  return {
    element: section,
    getState: () => {
      return isAccessSelected;
    },
  };
}
