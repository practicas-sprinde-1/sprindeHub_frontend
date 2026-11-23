import { setTag } from "../api/tag.api.js";
import { getLightClients } from "../api/client.api.js";
import { showNotification } from "../components/notifications.js";
import {
  createTagEditorFields,
  getTagChanges,
} from "../components/tag-form.js";

export async function openNewTagModal(onSaveSuccess) {
  if (document.querySelector(".modal-overlay, dialog[open]")) return;

  const modal = createNewTagModal();

  modal.closeButton.addEventListener("click", () => modal.dialog.close());
  modal.cancelButton.addEventListener("click", () => modal.dialog.close());
  modal.dialog.addEventListener("close", () => modal.dialog.remove());
  modal.dialog.addEventListener("cancel", (event) => {
    if (modal.isSaving) event.preventDefault();
  });
  modal.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveNewTag(modal, onSaveSuccess);
  });

  document.body.append(modal.dialog);
  showFormStatus(modal, "Cargando clientes...");
  modal.dialog.showModal();
  await loadClients(modal);
}

async function loadClients(modal) {
  try {
    const clients = await getLightClients("clients");

    if (modal.dialog.open === false) {
      return;
    }

    const defaultOption = new Option("Selecciona un cliente", "");
    modal.clientSelect.replaceChildren(defaultOption);

    // 4. Manejar el caso de que la base de datos no devuelva clientes
    if (clients.length === 0) {
      modal.formFields.disabled = true;
      modal.saveButton.disabled = true;
      showFormStatus(
        modal,
        "No hay clientes disponibles. Crea un cliente antes de añadir un dispositivo.",
      );

      return;
    }

    modal.formFields.disabled = false;
    modal.saveButton.disabled = false;
    showFormStatus(modal, "");

    for (const client of clients) {
      const clientOption = new Option(client.name, String(client.id));
      modal.clientSelect.append(clientOption);
    }

    modal.clientSelect.focus();
  } catch (error) {
    if (modal.dialog.open === false) {
      return;
    }

    showFormStatus(modal, error.message);
    //Lo mismo que option = document.createElement("option"), .textContent = "" .value=""
    const errorOption = new Option("No se han podido cargar los clientes", "");
    modal.clientSelect.replaceChildren(errorOption);
  }
}
async function saveNewTag(modal, onSaveSuccess) {
  if (modal.isSaving || modal.formFields.disabled) return;

  const formValues = modal.form.elements;
  const tagData = {
    ...getTagChanges(modal.inputs),
    client_id: Number(formValues.client_id.value),
  };

  setSavingState(modal, true);
  showFormStatus(modal, "Guardando dispositivo...");
  try {
    await setTag(tagData);
  } catch (error) {
    showFormStatus(modal, error.message);
    return;
  } finally {
    setSavingState(modal, false);
  }

  modal.dialog.close();
  showNotification({
    type: "success",
    title: "Dispositivo creado",
    message: "El dispositivo se ha guardado correctamente.",
  });
  await onSaveSuccess();
}

function setSavingState(modal, isSaving) {
  modal.isSaving = isSaving;
  modal.formFields.disabled = isSaving;
  modal.saveButton.disabled = isSaving;
  modal.closeButton.disabled = isSaving;
  modal.cancelButton.disabled = isSaving;
  modal.saveButton.textContent = isSaving
    ? "Guardando..."
    : "Guardar dispositivo";
}

function showFormStatus(modal, message) {
  modal.statusMessage.textContent = message;
  modal.statusMessage.hidden = !message;
}

function createNewTagModal() {
  const dialog = document.createElement("dialog");
  dialog.className = "tag-modal";
  dialog.id = "new-tag-dialog";

  const closeButton = createButton("close-tag-dialog", "×", "tag-close-button");

  const title = document.createElement("h2");
  title.id = "new-tag-title";
  title.textContent = "Nuevo dispositivo";

  const description = document.createElement("p");
  description.id = "new-tag-description";
  description.textContent = "Los campos con * son obligatorios.";

  const formElements = createTagForm();
  dialog.append(closeButton, title, description, formElements.form);

  return {
    dialog,
    closeButton,
    ...formElements,
    isSaving: false,
  };
}

function createTagForm() {
  const form = document.createElement("form");
  form.id = "tag-form";
  form.classList.add("tag-form");

  const formFields = document.createElement("fieldset");
  formFields.id = "tag-form-fields";
  formFields.classList.add("tag-form-fields");
  formFields.disabled = true;

  const legend = document.createElement("legend");
  legend.textContent = "Datos del dispositivo";

  const clientSelect = document.createElement("select");
  clientSelect.name = "client_id";
  clientSelect.required = true;
  clientSelect.autofocus = true;
  clientSelect.append(new Option("Cargando clientes...", ""));

  const { inputs, inputElements } = createTagEditorFields(
    {},
    "tag-form-field",
  );
  formFields.append(
    legend,
    createField("Cliente *", clientSelect),
    ...inputElements,
  );

  const statusMessage = document.createElement("p");
  statusMessage.id = "tag-form-status";

  statusMessage.hidden = true;

  const cancelButton = createButton(
    "cancel-tag-dialog",
    "Cancelar",
    "tag-cancel-button",
  );
  const saveButton = createButton("save-tag", "Guardar dispositivo");
  saveButton.type = "submit";
  saveButton.disabled = true;

  const actions = document.createElement("div");
  actions.className = "tag-modal-actions";
  actions.append(cancelButton, saveButton);

  form.append(formFields, statusMessage, actions);
  return {
    form,
    formFields,
    clientSelect,
    inputs,
    statusMessage,
    cancelButton,
    saveButton,
  };
}

function createField(labelText, input) {
  const label = document.createElement("label");
  label.textContent = labelText;
  label.append(input);
  return label;
}

function createButton(id, text, className = "") {
  const button = document.createElement("button");
  button.id = id;
  button.type = "button";
  button.className = className;
  button.textContent = text;
  return button;
}
