//Solicita datos al endpoint indicado
export async function getData(url, errorMessage) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

//Envía los datos del cliente al endpoint indicado
export async function sendData(url, data, errorMessage) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

//Envía los datos modificados del cliente al endpoint indicado
export async function modifyData(url, data, errorMessage) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

//Envía los datos modificados del cliente al endpoint indicado
export async function deleteData(url, errorMessage) {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

//Envía los datos modificados del cliente al endpoint indicado
export async function archiveOrRestoreData(url, errorMessage) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}
