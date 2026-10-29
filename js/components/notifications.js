const DEFAULT_DURATION = 5000;

export function showNotification({
  type = "info",
  title,
  message,
  duration = DEFAULT_DURATION,
}) {
  let container = document.querySelector("#notifications");

  if (!container) {
    container = document.createElement("div");
    container.id = "notifications";
    container.classList.add("notifications");
    document.body.append(container);
  }

  const notification = document.createElement("div");
  notification.classList.add("notification", `notification-${type}`);

  const content = document.createElement("div");
  content.classList.add("notification-content");

  const titleElement = document.createElement("strong");
  titleElement.textContent = title;

  const messageElement = document.createElement("p");
  messageElement.textContent = message;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.classList.add("notification-close");
  closeButton.textContent = "Cerrar";

  const close = () => notification.remove();

  closeButton.addEventListener("click", close);

  content.append(titleElement, messageElement);
  notification.append(content, closeButton);
  container.append(notification);

  if (duration > 0) {
    window.setTimeout(close, duration);
  }

  return close;
}
