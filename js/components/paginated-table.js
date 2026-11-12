import { showNotification } from "./notifications.js";

// Cada página indica cómo pedir sus datos y cómo construir una fila.
export function createPaginatedTable(options) {
  const tableBody = options.tableBody;
  const searchInput = options.searchInput;
  const recordsPerPageSelect = options.recordsPerPageSelect;
  const previousPageButton = options.previousPageButton;
  const nextPageButton = options.nextPageButton;
  const pageInformation = options.pageInformation;

  const tableState = {
    search: "",
    currentPage: 1,
    pageSize: Number(recordsPerPageSelect.value),
    totalRecords: null,
    loadedRecords: 0,
    filters: {},
  };

  if (options.initialFilters !== undefined) {
    tableState.filters = options.initialFilters;
  }

  let latestRequestId = 0;
  let searchTimeout;

  function disablePaginationButtons() {
    previousPageButton.disabled = true;
    nextPageButton.disabled = true;
  }

  function updatePagination() {
    previousPageButton.disabled = tableState.currentPage === 1;
    if (tableState.totalRecords === null) {
      pageInformation.textContent = `Página ${tableState.currentPage}`;
      nextPageButton.disabled = tableState.loadedRecords < tableState.pageSize;
      return;
    }

    let totalPages = Math.ceil(tableState.totalRecords / tableState.pageSize);
    if (totalPages === 0) {
      totalPages = 1;
    }

    pageInformation.textContent = `Página ${tableState.currentPage} de ${totalPages} (${tableState.totalRecords} registros)`;
    nextPageButton.disabled = tableState.currentPage >= totalPages;
  }

  async function load(page = tableState.currentPage) {
    latestRequestId += 1;
    const requestId = latestRequestId;
    const pageSize = tableState.pageSize;
    const offset = (page - 1) * pageSize;

    disablePaginationButtons();

    if (options.onLoad !== undefined) {
      options.onLoad();
    }

    try {
      const response = await options.loadPage({
        limit: pageSize,
        offset: offset,
        search: tableState.search,
        filters: tableState.filters,
      });

      // Si el usuario ha pedido otros datos, esta respuesta ya no se muestra.
      if (requestId !== latestRequestId) {
        return;
      }

      const items = response.items;
      let totalRecords = null;
      let responsePageSize = pageSize;
      let responseOffset = offset;

      if (response.total !== undefined) {
        totalRecords = response.total;
      }
      if (response.limit !== undefined) {
        responsePageSize = response.limit;
      }
      if (response.offset !== undefined) {
        responseOffset = response.offset;
      }

      // El total puede reducirse y dejar la página solicitada fuera de rango.
      if (
        totalRecords !== null &&
        responseOffset > 0 &&
        responseOffset >= totalRecords
      ) {
        let lastPage = Math.ceil(totalRecords / responsePageSize);
        if (lastPage === 0) {
          lastPage = 1;
        }
        return load(lastPage);
      }

      // Sin un total, una página vacía indica que hay que retroceder.
      if (totalRecords === null && responseOffset > 0 && items.length === 0) {
        return load(page - 1);
      }

      const rows = [];
      for (const item of items) {
        const row = await options.createRow(item);

        // Crear una fila también puede requerir una petición a la API.
        if (requestId !== latestRequestId) {
          return;
        }

        rows.push(row);
      }

      tableBody.replaceChildren(...rows);
      tableState.currentPage =
        Math.floor(responseOffset / responsePageSize) + 1;
      tableState.pageSize = responsePageSize;
      tableState.totalRecords = totalRecords;
      tableState.loadedRecords = items.length;
    } catch (error) {
      if (requestId !== latestRequestId) {
        return;
      }

      showNotification({
        type: "error",
        title: options.errorTitle,
        message: error.message,
      });
    }

    updatePagination();
  }

  function resetTable() {
    clearTimeout(searchTimeout);
    tableState.search = searchInput.value.trim().toLowerCase();
    tableState.currentPage = 1;
    tableState.totalRecords = null;
    tableState.loadedRecords = 0;
    tableBody.replaceChildren();
    return load(1);
  }

  function setFilters(filters) {
    // Conserva los filtros anteriores y actualiza los que han cambiado.
    const updatedFilters = { ...tableState.filters };
    for (const name of Object.keys(filters)) {
      updatedFilters[name] = filters[name];
    }
    tableState.filters = updatedFilters;
    return resetTable();
  }

  function handleSearchInput() {
    clearTimeout(searchTimeout);

    // Ignora la petición anterior mientras espera a que el usuario termine de escribir.
    latestRequestId += 1;
    disablePaginationButtons();
    searchTimeout = setTimeout(resetTable, 500);
  }

  function handlePageSizeChange() {
    tableState.pageSize = Number(recordsPerPageSelect.value);
    resetTable();
  }

  async function showPreviousPage() {
    if (previousPageButton.disabled) {
      return;
    }

    await load(tableState.currentPage - 1);
    window.scrollTo(0, 0);
  }

  async function showNextPage() {
    if (nextPageButton.disabled) {
      return;
    }

    await load(tableState.currentPage + 1);
    window.scrollTo(0, 0);
  }

  searchInput.addEventListener("input", handleSearchInput);
  recordsPerPageSelect.addEventListener("change", handlePageSizeChange);
  previousPageButton.addEventListener("click", showPreviousPage);
  nextPageButton.addEventListener("click", showNextPage);

  return {
    load: load,
    setFilters: setFilters,
  };
}
