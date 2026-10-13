export const projectDetailData = {
  id: 1,
  name: "ERP corporativo",
  description:
    "Plataforma de gestión interna para los procesos administrativos y comerciales de ACME.",
  client_id: 1,
  is_active: true,

  client: {
    id: 1,
    name: "ACME",
  },

  environments: [
    {
      id: 1,
      project_id: 1,
      type: "production",
      url: "https://erp.acme.es",
    },
    {
      id: 2,
      project_id: 1,
      type: "staging",
      url: "https://staging.erp.acme.es",
    },
  ],

  repositories: [
    {
      id: 1,
      project_id: 1,
      type: "frontend",
      url: "https://github.com/practicas-sprinde-1/acme-erp-frontend",
    },
    {
      id: 2,
      project_id: 1,
      type: "backend",
      url: "https://github.com/practicas-sprinde-1/acme-erp-backend",
    },
  ],

  domains: [
    {
      id: 1,
      project_id: 1,
      url: "https://erp.acme.es",
    },
  ],

  services: [
    {
      id: 1,
      name: "Hetzner",
    },
    {
      id: 2,
      name: "Mailgun",
    },
  ],

  commands: [
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
  ],

  links: [
    {
      id: 1,
      project_id: 1,
      title: "Guía de despliegue",
      url: "https://docs.example.com/acme-erp/deploy",
    },
  ],

  notes: [
    {
      id: 1,
      project_id: 1,
      description: "Acceso de producción",
      content:
        "Solicitar acceso al panel de Hetzner al responsable técnico antes de realizar un despliegue.",
    },
  ],
};
