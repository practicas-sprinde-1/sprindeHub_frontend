let inputId = 0;

export function createTagEditorFields(
  tag = {},
  fieldClassName = "tag-form-field",
) {
  const inputs = createTagForm(tag);
  const inputElements = [
    createField("Dispositivo (tipo) *", inputs.tag_type, fieldClassName),
    createField("Marca *", inputs.brand, fieldClassName),
    createField("Modelo *", inputs.model, fieldClassName),
    createField("Dirección MAC (opcional)", inputs.mac, fieldClassName),
    createField("Dirección IP (opcional)", inputs.ip, fieldClassName),
  ];
  return { inputs, inputElements };
}

function createTagForm(tag) {
  const tagType = createInput("text", tag.tag_type, "tag_type");
  const brand = createInput("text", tag.brand, "brand");
  const model = createInput("text", tag.model, "model");
  const mac = createInput("text", tag.mac, "mac");
  const ip = createInput("text", tag.ip, "ip");

  tagType.maxLength = 50;
  brand.maxLength = 50;
  model.maxLength = 100;
  mac.maxLength = 255;
  ip.maxLength = 255;

  tagType.required = true;
  brand.required = true;
  model.required = true;

  return { tag_type: tagType, brand, model, mac, ip };
}

export function getTagChanges(inputs) {
  return {
    tag_type: inputs.tag_type.value.trim(),
    brand: inputs.brand.value.trim(),
    model: inputs.model.value.trim(),
    mac: inputs.mac.value.trim() || null,
    ip: inputs.ip.value.trim() || null,
  };
}

function createInput(type, value, name) {
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.value = value ?? "";
  inputId += 1;
  input.id = `tag-${name}-${inputId}`;
  return input;
}

function createField(labelText, input, className) {
  const field = document.createElement("div");
  field.classList.add(className);
  const label = document.createElement("label");
  label.textContent = labelText;
  label.htmlFor = input.id;
  field.append(label, input);
  return field;
}
