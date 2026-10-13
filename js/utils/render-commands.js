export function renderCommands(list, commands) {
  commands.forEach((command) => {
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
    copyButton.textContent = "Copiar";

    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(command.instruction);
        copyButton.textContent = "Copiado";

        setTimeout(() => {
          copyButton.textContent = "Copiar";
        }, 1500);
      } catch {
        copyButton.textContent = "Error al copiar";
      }
    });

    commandContent.append(commandName, commandInstruction);
    listItem.append(commandContent, copyButton);
    list.append(listItem);
  });
}
