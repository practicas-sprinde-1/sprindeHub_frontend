export function createCheckboxListManager(container) {
  if (!container) {
    throw new Error("No se ha encontrado el contenedor de checkboxes.");
  }

  const searchInput = container.querySelector("[data-checkbox-search]");
  const counterElement = container.querySelector("[data-checkbox-counter]");
  const checkboxList = container.querySelector("[data-checkbox-list]");

  checkRequiredElements(searchInput, counterElement, checkboxList);

  const checkboxes = checkboxList.querySelectorAll('input[type="checkbox"]');
  const selectedValues = new Set();

  loadInitialSelectedValues();
  addEventListeners();
  updateCounter();

  function loadInitialSelectedValues() {
    checkboxes.forEach((checkbox) => {
      if (!checkbox.checked) {
        return;
      }

      selectedValues.add(checkbox.value);
    });
  }

  function addEventListeners() {
    searchInput.addEventListener("input", handleSearchInput);

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        handleCheckboxChange(checkbox);
      });
    });
  }

  function handleSearchInput() {
    const searchText = normalizeText(searchInput.value);

    filterCheckboxItems(searchText);
  }

  function filterCheckboxItems(searchText) {
    checkboxes.forEach((checkbox) => {
      const checkboxItem = checkbox.closest("[data-checkbox-item]");

      if (!checkboxItem) {
        return;
      }

      const checkboxItemText = normalizeText(checkboxItem.textContent);
      const itemMatchesSearch = checkboxItemText.includes(searchText);

      if (itemMatchesSearch) {
        checkboxItem.classList.remove("hidden");
        return;
      }

      // Se oculta el elemento completo para que la lista no deje espacios vacíos.
      checkboxItem.classList.add("hidden");
    });
  }

  function handleCheckboxChange(checkbox) {
    if (checkbox.checked) {
      selectedValues.add(checkbox.value);
      updateCounter();
      return;
    }

    selectedValues.delete(checkbox.value);
    updateCounter();
  }

  function updateCounter() {
    const selectedCheckboxCount = selectedValues.size;

    counterElement.textContent = String(selectedCheckboxCount);
  }

  function getSelectedValues() {
    return Array.from(selectedValues);
  }

  return {
    getSelectedValues,
  };
}

function checkRequiredElements(searchInput, counterElement, checkboxList) {
  if (!searchInput) {
    throw new Error("No se ha encontrado el buscador de checkboxes.");
  }

  if (!counterElement) {
    throw new Error("No se ha encontrado el contador de checkboxes.");
  }

  if (!checkboxList) {
    throw new Error("No se ha encontrado la lista de checkboxes.");
  }
}

function normalizeText(text) {
  return text.trim().toLowerCase();
}
