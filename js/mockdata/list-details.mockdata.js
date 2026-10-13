// Estos datos simulan las respuestas de tres endpoints de detalle.
// Cada función recibe el id de un proyecto y devuelve solo sus elementos.

const commandsMockData = [
  {
    id: 1,
    project_id: 1,
    name: "Iniciar frontend",
    instruction: "npm run dev",
  },
  {
    id: 2,
    project_id: 1,
    name: "Crear build",
    instruction: "npm run build",
  },
  {
    id: 3,
    project_id: 2,
    name: "Ejecutar tests",
    instruction: "npm run test",
  },
  {
    id: 4,
    project_id: 2,
    name: "Aplicar migraciones",
    instruction: "alembic upgrade head",
  },
  {
    id: 5,
    project_id: 3,
    name: "Levantar servicios",
    instruction: "docker compose up -d",
  },
  {
    id: 6,
    project_id: 4,
    name: "Instalar dependencias",
    instruction: "npm install",
  },
];

const linksMockData = [
  {
    id: 1,
    project_id: 1,
    title: "Guía de despliegue",
    url: "https://docs.example.com/acme-erp/deploy",
  },
  {
    id: 2,
    project_id: 2,
    title: "Documentación de la API",
    url: "https://docs.example.com/norte-digital/api",
  },
  {
    id: 3,
    project_id: 2,
    title: "Diseño en Figma",
    url: "https://www.figma.com/file/norte-digital-clientes",
  },
  {
    id: 4,
    project_id: 3,
    title: "Manual de Stripe",
    url: "https://docs.stripe.com",
  },
  {
    id: 5,
    project_id: 4,
    title: "Manual de reservas",
    url: "https://docs.example.com/verde-claro/reservas",
  },
];

const notesMockData = [
  {
    id: 1,
    project_id: 1,
    description: "Acceso de producción",
    content:
      "Solicitar acceso al panel de Hetzner al responsable técnico antes de realizar un despliegue.",
  },
  {
    id: 2,
    project_id: 2,
    description: "Entorno de pruebas",
    content:
      "La base de datos de desarrollo se reinicia cada lunes a las 08:00.",
  },
  {
    id: 3,
    project_id: 3,
    description: "Pagos",
    content:
      "Usar siempre las claves de prueba de Stripe fuera del entorno de producción.",
  },
  {
    id: 4,
    project_id: 4,
    description: "Reservas antiguas",
    content:
      "No modificar reservas anteriores a 2024 sin confirmación del cliente.",
  },
];

async function getItemsByProject(items, projectId) {
  return items.filter((item) => item.project_id === Number(projectId));
}

export function getCommands(projectId) {
  return getItemsByProject(commandsMockData, projectId);
}

export function getLinks(projectId) {
  return getItemsByProject(linksMockData, projectId);
}

export function getNotes(projectId) {
  return getItemsByProject(notesMockData, projectId);
}
