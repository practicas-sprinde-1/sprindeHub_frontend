export function createLogsFilterBar(onFiltersChanged, users = []) {
  const filterBar = document.createElement("div");
  filterBar.className = "logs-filter-bar";

  const startDateInput = document.createElement("input");
  startDateInput.type = "date";
  startDateInput.name = "startDate";
  filterBar.append(createFilterField("Fecha Inicio", startDateInput));

  const endDateInput = document.createElement("input");
  endDateInput.type = "date";
  endDateInput.name = "endDate";
  filterBar.append(createFilterField("Fecha Fin", endDateInput));

  const actionTypeSelect = document.createElement("select");
  actionTypeSelect.name = "actionType";
  appendSelectOptions(actionTypeSelect, [
    { value: "", label: "Todos" },
    { value: "CREATE", label: "Creado" },
    { value: "UPDATE", label: "Actualizado" },
    { value: "DELETE", label: "Borrado" },
  ]);
  filterBar.append(createFilterField("Acción", actionTypeSelect));

  const userSelect = document.createElement("select");
  userSelect.name = "user";
  const userOptions = [{ value: "", label: "Todos" }];

  for (const user of users) {
    userOptions.push({ value: user.username, label: user.username });
  }

  appendSelectOptions(userSelect, userOptions);
  filterBar.append(createFilterField("Usuario", userSelect));

  const entityTypeSelect = document.createElement("select");
  entityTypeSelect.name = "entityType";
  appendSelectOptions(entityTypeSelect, [
    { value: "", label: "Todos" },
    { value: "CLIENT", label: "Cliente" },
    { value: "PROJECT", label: "Proyecto" },
    { value: "COMMAND", label: "Comando" },
    { value: "DOMAIN", label: "Dominio" },
    { value: "ENVIRONMENT", label: "Entorno" },
    { value: "LINK", label: "Enlace" },
    { value: "NOTE", label: "Nota" },
    { value: "REPOSITORY", label: "Repositorio" },
    { value: "SERVICE", label: "Servicio" },
  ]);
  filterBar.append(createFilterField("Entidad", entityTypeSelect));

  function updateFilters() {
    const filterState = {
      startDate: startDateInput.value,
      endDate: endDateInput.value,
      actionType: actionTypeSelect.value,
      user: userSelect.value,
      entityType: entityTypeSelect.value,
    };

    onFiltersChanged(filterState);
  }

  startDateInput.addEventListener("change", updateFilters);
  endDateInput.addEventListener("change", updateFilters);
  actionTypeSelect.addEventListener("change", updateFilters);
  userSelect.addEventListener("change", updateFilters);
  entityTypeSelect.addEventListener("change", updateFilters);

  return filterBar;
}

function createFilterField(labelText, inputElement) {
  const fieldLabel = document.createElement("label");
  fieldLabel.className = "logs-filter-bar-field";

  const labelTextElement = document.createElement("span");
  labelTextElement.className = "logs-filter-bar-label";
  labelTextElement.textContent = labelText;

  fieldLabel.append(labelTextElement, inputElement);
  return fieldLabel;
}

function appendSelectOptions(selectElement, options) {
  for (const option of options) {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    selectElement.append(optionElement);
  }
}
