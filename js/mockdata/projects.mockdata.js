const projectDefinitions = [
  ['ERP corporativo', 1, 'ACME', 'acme-erp'], ['Portal de clientes', 2, 'Norte Digital', 'norte-clientes'], ['Tienda online', 3, 'Brava Foods', 'brava-store'], ['Gestión de reservas', 4, 'Verde Claro', 'verde-reservas'],
  ['Intranet Atlas', 5, 'Soluciones Atlas', 'atlas-intranet'], ['Portfolio corporativo', 6, 'Lumen Studio', 'lumen-portfolio'], ['Panel de operaciones', 7, 'Costa Azul', 'costa-operaciones'], ['CRM comercial', 8, 'Grupo Horizonte', 'horizonte-crm'],
  ['Control de flota', 9, 'Nexo Logística', 'nexo-flota'], ['Portal de soporte', 10, 'Alba Tecnología', 'alba-soporte'], ['Gestor documental', 11, 'Punto Norte', 'punto-documentos'], ['Web corporativa', 12, 'Marea Creativa', 'marea-web'],
  ['Expedientes digitales', 13, 'Vértice Legal', 'vertice-expedientes'], ['Panel de consultoría', 14, 'Orbe Consultores', 'orbe-panel'], ['Plataforma de clientes', 15, 'Faro Iberia', 'faro-clientes'], ['Catálogo sostenible', 16, 'Raíz Verde', 'raiz-catalogo'],
  ['Campañas digitales', 17, 'Impulso Media', 'impulso-campanas'], ['Planificador de obras', 18, 'Delta Obras', 'delta-obras'], ['Citas médicas', 19, 'Círculo Salud', 'circulo-citas'], ['Control de producción', 20, 'Trama Textil', 'trama-produccion'],
  ['Monitor de sistemas', 21, 'Kairo Sistemas', 'kairo-monitor'], ['Panel financiero', 22, 'Boreal Finanzas', 'boreal-finanzas'], ['Aula virtual', 23, 'Aurea Formación', 'aurea-aula'], ['Cuadro de mandos', 24, 'Métrica Digital', 'metrica-dashboard'],
  ['Gestor de pedidos', 25, 'Senda Retail', 'senda-pedidos'], ['Trazabilidad alimentaria', 26, 'Litoral Foods', 'litoral-trazabilidad'], ['Control de proyectos', 27, 'Cobalto Ingeniería', 'cobalto-proyectos'], ['Gestión de eventos', 28, 'Artemisa Eventos', 'artemisa-eventos'],
  ['Portal de distribuidores', 29, 'Sierra Sur', 'sierra-distribuidores'], ['Automatización interna', 30, 'Evolutiva', 'evolutiva-automatizacion'], ['Consumo energético', 31, 'Nova Energía', 'nova-energia'], ['Campus de aprendizaje', 32, 'Campus Uno', 'campus-aprendizaje'],
  ['Gestor de servicios', 33, 'Aldea Servicios', 'aldea-servicios'], ['Estudio de proyectos', 34, 'Pilar Arquitectura', 'pilar-estudio'], ['Reservas de viajes', 35, 'Brújula Viajes', 'brujula-reservas'], ['Gestión de activos', 36, 'Río Alto', 'rio-activos'],
  ['Biblioteca visual', 37, 'Mosaico Diseño', 'mosaico-biblioteca'], ['Consola cloud', 38, 'Esfera Cloud', 'esfera-consola'], ['Portal comercial', 39, 'Vía Comercial', 'via-comercial'], ['Catálogo de productos', 40, 'Nácar Cosmética', 'nacar-catalogo'],
  ['Seguimiento de clientes', 41, 'Tándem Consultoría', 'tandem-seguimiento'], ['Tienda gourmet', 42, 'Olivo Gourmet', 'olivo-tienda'], ['Analítica de negocio', 43, 'Prisma Analítica', 'prisma-analitica'], ['Gestión académica', 44, 'Vector Formación', 'vector-academica'],
  ['Rutas de transporte', 45, 'Mistral Transporte', 'mistral-rutas'], ['Oficina de proyectos', 46, 'Zenit Proyectos', 'zenit-oficina'], ['Mantenimiento industrial', 47, 'Cima Industrial', 'cima-mantenimiento'], ['Gestor editorial', 48, 'Lámina Editorial', 'lamina-editorial'],
  ['Plataforma de datos', 49, 'Umbral Data', 'umbral-datos'], ['Tienda natural', 50, 'Origen Natural', 'origen-tienda'],
];

export const projectsMockData = {
  items: projectDefinitions.map(([name, clientId, clientName, slug], index) => {
    const id = index + 1;
    const baseId = id * 10;
    return {
      id,
      name,
      client: { id: clientId, name: clientName },
      environments: [
        { id: baseId + 1, type: 'production', url: `https://${slug}.es` },
        { id: baseId + 2, type: 'staging', url: `https://staging.${slug}.es` },
      ],
      repositories: [
        { id: baseId + 3, type: 'frontend', url: `https://github.com/practicas-sprinde-1/${slug}-frontend` },
        { id: baseId + 4, type: 'backend', url: `https://github.com/practicas-sprinde-1/${slug}-backend` },
      ],
      services: [
        { id: baseId + 5, name: index % 2 === 0 ? 'Hetzner' : 'Vercel' },
        { id: baseId + 6, name: index % 2 === 0 ? 'Mailgun' : 'Supabase' },
      ],
      domains: [{ id: baseId + 7, url: `${slug}.es` }],
      commands_count: (index % 6) + 1,
      links_count: (index % 4) + 1,
      notes_count: (index % 5) + 1,
    };
  }),
  total: projectDefinitions.length,
  offset: 0,
  limit: 20,
};
