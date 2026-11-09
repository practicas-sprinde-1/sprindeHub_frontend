const COPY_BUTTON_TEXT = "Copiar";
const COPY_SUCCESS_TEXT = "Copiado";
const COPY_ERROR_TEXT = "Error al copiar";
const COPY_FEEDBACK_DURATION_MS = 1500;

export function renderCommands(list, commands) {
  commands.forEach((command) => {
    list.append(createCommandListItem(command));
  });
}

function createCommandListItem(command) {
  const listItem = document.createElement("li");
  const commandContent = document.createElement("div");
  const commandName = document.createElement("strong");
  const commandInstruction = document.createElement("code");
  const copyButton = document.createElement("button");

  listItem.classList.add("command-item");
  commandContent.classList.add("command-content");
  commandName.textContent = command.name;
  commandInstruction.textContent = command.instruction;

  copyButton.type = "button";
  copyButton.classList.add("command-copy-button");
  copyButton.textContent = COPY_BUTTON_TEXT;
  copyButton.addEventListener("click", () =>
    copyCommandToClipboard(command.instruction, copyButton),
  );

  commandContent.append(commandName, commandInstruction);
  listItem.append(commandContent, copyButton);

  return listItem;
}

async function copyCommandToClipboard(commandInstruction, copyButton) {
  try {
    await navigator.clipboard.writeText(commandInstruction);
    copyButton.textContent = COPY_SUCCESS_TEXT;

    setTimeout(() => {
      copyButton.textContent = COPY_BUTTON_TEXT;
    }, COPY_FEEDBACK_DURATION_MS);
  } catch {
    copyButton.textContent = COPY_ERROR_TEXT;
  }
}
