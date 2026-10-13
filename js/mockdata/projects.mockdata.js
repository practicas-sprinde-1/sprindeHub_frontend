export const projectsMockData = {
  items: [
    {
      id: 1,
      name: "ERP corporativo",
      client: {
        id: 1,
        name: "ACME",
      },
      environments: [
        {
          id: 1,
          type: "production",
          url: "https://erp.acme.es",
        },
        {
          id: 2,
          type: "staging",
          url: "https://staging.erp.acme.es",
        },
      ],
      repositories: [
        {
          id: 1,
          type: "frontend",
          url: "https://github.com/practicas-sprinde-1/acme-erp-frontend",
        },
        {
          id: 2,
          type: "backend",
          url: "https://github.com/practicas-sprinde-1/acme-erp-backend",
        },
      ],
      services: [
        { id: 1, name: "Hetzner" },
        { id: 2, name: "Mailgun" },
      ],
      domains: [{ id: 1, url: "erp.acme.es" }],
      commands_count: 2,
      links_count: 1,
      notes_count: 1,
    },
    {
      id: 2,
      name: "Portal de clientes",
      client: {
        id: 2,
        name: "Norte Digital",
      },
      environments: [
        {
          id: 3,
          type: "production",
          url: "https://clientes.nortedigital.es",
        },
        {
          id: 4,
          type: "development",
          url: "https://dev.clientes.nortedigital.es",
        },
      ],
      repositories: [
        {
          id: 3,
          type: "frontend",
          url: "https://github.com/practicas-sprinde-1/norte-clientes-web",
        },
        {
          id: 4,
          type: "qa",
          url: "https://github.com/practicas-sprinde-1/norte-clientes-api",
        },
      ],
      services: [
        { id: 3, name: "Vercel" },
        { id: 4, name: "Supabase" },
      ],
      domains: [{ id: 2, url: "clientes.nortedigital.es" }],
      commands_count: 4,
      links_count: 3,
      notes_count: 2,
    },
    {
      id: 3,
      name: "Tienda online",
      client: {
        id: 3,
        name: "Brava Foods",
      },
      environments: [
        {
          id: 5,
          type: "test",
          url: "https://shop.bravafoods.com",
        },
      ],
      repositories: [
        {
          id: 5,
          type: "devops",
          url: "https://github.com/practicas-sprinde-1/brava-storefront",
        },
      ],
      services: [
        { id: 5, name: "AWS" },
        { id: 6, name: "Stripe" },
        { id: 7, name: "SendGrid" },
      ],
      domains: [
        { id: 3, url: "shop.bravafoods.com" },
        { id: 4, url: "bravafoods.com" },
      ],
      commands_count: 6,
      links_count: 4,
      notes_count: 3,
    },
    {
      id: 4,
      name: "Gestión de reservas",
      client: {
        id: 4,
        name: "Verde Claro",
      },
      environments: [
        {
          id: 6,
          type: "staging",
          url: "https://staging.reservas.verdeclaro.es",
        },
        {
          id: 7,
          type: "development",
          url: "https://dev.reservas.verdeclaro.es",
        },
      ],
      repositories: [
        {
          id: 6,
          type: "frontend",
          url: "https://github.com/practicas-sprinde-1/verde-reservas-web",
        },
      ],
      services: [
        { id: 8, name: "DigitalOcean" },
        { id: 9, name: "Postmark" },
      ],
      domains: [{ id: 5, url: "reservas.verdeclaro.es" }],
      commands_count: 5,
      links_count: 2,
      notes_count: 4,
    },
  ],
  total: 4,
  offset: 0,
  limit: 20,
};
