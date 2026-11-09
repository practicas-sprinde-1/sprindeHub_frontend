const DEFAULT_DURATION = 5000;

export function showNotification({
  type = "info",
  title,
  message,
  duration = DEFAULT_DURATION,
}) {
  const container = getNotificationContainer();
  const { notificationElement, dismiss } = createNotification({
    type,
    title,
    message,
  });

  container.append(notificationElement);
  autoClose(dismiss, duration);

  return dismiss;
}

function getNotificationContainer() {
  const existingContainer = document.querySelector("#notifications");

  if (existingContainer) {
    return existingContainer;
  }

  const container = document.createElement("div");
  container.id = "notifications";
  container.classList.add("notifications");
  document.body.append(container);

  return container;
}

function createNotification({ type, title, message }) {
  const notificationElement = document.createElement("div");
  notificationElement.classList.add("notification", `notification-${type}`);

  const contentElement = createNotificationContent({ title, message });
  const dismissButton = createDismissButton();
  const dismiss = () => notificationElement.remove();

  dismissButton.addEventListener("click", dismiss);
  notificationElement.append(contentElement, dismissButton);

  return { notificationElement, dismiss };
}

function createNotificationContent({ title, message }) {
  const contentElement = document.createElement("div");
  contentElement.classList.add("notification-content");

  const titleElement = document.createElement("strong");
  titleElement.textContent = title;

  const messageElement = document.createElement("p");
  messageElement.textContent = message;

  contentElement.append(titleElement, messageElement);

  return contentElement;
}

function createDismissButton() {
  const dismissButton = document.createElement("button");
  dismissButton.type = "button";
  dismissButton.classList.add("notification-close");
  dismissButton.textContent = "Cerrar";

  return dismissButton;
}

function autoClose(dismiss, duration) {
  if (!(duration > 0)) {
    return;
  }

  window.setTimeout(dismiss, duration);
}
