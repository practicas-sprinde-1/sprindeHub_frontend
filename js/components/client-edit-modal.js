import { modifyClient } from "../api/client.api.js";
import { getProjects, modifyProject } from "../api/project.api.js";

export async function createEditModalClient(client, onSave) {
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

  const projectsResponse = await getProjects();
  const projects = projectsResponse.items ?? projectsResponse;

  const initialProjects = projects.filter((project) => {
    const projectClientId = project.client_id ?? project.client?.id;

    return Number(projectClientId) === Number(client.id);
  });

  const initialProjectsId = initialProjects.map((project) => project.id);

  const projectCheckBoxList = createProjectCheckBoxList(
    projects,
    initialProjectsId,
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
