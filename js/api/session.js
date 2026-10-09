export function checkToken() {
  const accessToken = sessionStorage.getItem("accessToken");

  if (!accessToken) {
    window.location.replace("/pages/login.html");
  }
}

export function logout() {
  sessionStorage.removeItem("accessToken");
  window.location.replace("/pages/login.html");
}
