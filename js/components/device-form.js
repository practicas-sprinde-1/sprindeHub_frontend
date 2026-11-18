let inputId = 0;

export function createDeviceEditorFields(
  device = {},
  fieldClassName = "device-form-field",
) {
  const inputs = createDeviceForm(device);
  const inputElements = [
    createField("Dispositivo (tipo) *", inputs.device_type, fieldClassName),
    createField("Marca *", inputs.brand, fieldClassName),
    createField("Modelo *", inputs.model, fieldClassName),
    createField("Dirección MAC (opcional)", inputs.mac, fieldClassName),
    createField("Dirección IP (opcional)", inputs.ip, fieldClassName),
  ];
  return { inputs, inputElements };
}

function createDeviceForm(device) {
  const deviceType = createInput("text", device.device_type, "device_type");
  const brand = createInput("text", device.brand, "brand");
  const model = createInput("text", device.model, "model");
  const mac = createInput("text", device.mac, "mac");
  const ip = createInput("text", device.ip, "ip");

  deviceType.maxLength = 50;
  brand.maxLength = 50;
  model.maxLength = 100;
  mac.maxLength = 255;
  ip.maxLength = 255;

  deviceType.required = true;
  brand.required = true;
  model.required = true;

  return { device_type: deviceType, brand, model, mac, ip };
}

export function getDeviceChanges(inputs) {
  return {
    device_type: inputs.device_type.value.trim(),
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
  input.id = `device-${name}-${inputId}`;
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
