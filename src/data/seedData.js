// Datos Semilla Oficiales para REPUESTOS SOZA - MATAGALPA, NICARAGUA

export const initialCompanySettings = {
  company_name: 'Repuestos SOZA',
  tagline: 'Todo en repuestos, llantas, baterías y accesorios para motocicletas',
  ruc_nit: 'J0310000889211',
  phone: '+505 8389-8687',
  whatsapp_company: '50583898687',
  email: 'ventas@repuestosoza.com',
  address: 'De la Gasolinera Puma 2c al Norte, Matagalpa, Nicaragua',
  city: 'Matagalpa, Nicaragua',
  currency: '$',
  logo_url: ''
};

export const initialAdmins = [
  {
    id: 'adm-0001',
    username: 'admin',
    password: 'admin123',
    email: 'admin@repuestosoza.com',
    name: 'Administrador SOZA'
  }
];

export const initialSellers = [
  {
    id: 'sel-0001',
    name: 'Carlos Mendoza',
    username: 'carlosm',
    password: 'vendedor123',
    phone: '+505 8899-1122',
    active: true
  },
  {
    id: 'sel-0002',
    name: 'Valeria Gómez',
    username: 'valeriag',
    password: 'vendedor123',
    phone: '+505 8765-4321',
    active: true
  },
  {
    id: 'sel-0003',
    name: 'Mateo Morales',
    username: 'mateom',
    password: 'vendedor123',
    phone: '+505 8123-4567',
    active: true
  },
  {
    id: 'sel-0004',
    name: 'Sofía Castillo',
    username: 'sofiac',
    password: 'vendedor123',
    phone: '+505 8990-2345',
    active: true
  }
];

export const motorcycleBrands = [
  { name: 'TRX Tires & Batteries', color: 'from-blue-600 to-cyan-400' },
  { name: 'X-SPORS Helmets', color: 'from-red-600 to-rose-400' },
  { name: 'EVERESTT Motor Tech OEM', color: 'from-amber-600 to-orange-500' },
  { name: 'KIGCOL Quality Parts', color: 'from-indigo-600 to-blue-400' }
];

// Las 5 Categorías Oficiales
export const productCategories = [
  'Todos',
  'Motor',
  'Transmisión y Clutch',
  'Frenos y Suspensión',
  'Eléctrico',
  'Carrocería y Accesorios'
];

export const initialProducts = [
  {
    id: 'prod-moto-001',
    name: 'Kit de Cilindro y Pistón EVERESTT Motor Tech 150cc OEM',
    description: 'Kit completo de reparación de motor con cilindro rectificado de alta resistencia térmica, pistón reforzado, aros japoneses y empaquetadura completa.',
    category: 'Motor',
    price: 58.00,
    cost_price: 36.00,
    stock: 18,
    image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-moto-002',
    name: 'Carburador Racing KIGCOL PE28 con Cortina Plana',
    description: 'Carburador de alto desempeño para motos 150cc a 250cc. Respuesta instantánea al acelerador, fácil calibración y óptimo flujo de mezcla combustible.',
    category: 'Motor',
    price: 46.00,
    cost_price: 29.00,
    stock: 14,
    image_url: 'https://images.unsplash.com/photo-1580983218765-f663bec07b37?w=600&auto=format&fit=crop&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-moto-003',
    name: 'Kit de Arrastre Reforzado KIGCOL 428H (Catalina + Piñón + Cadena)',
    description: 'Kit de tracción con tratamiento térmico endurecido para máxima durabilidad, piñón y catalina de acero al carbono 1045 con cadena dorada de alta resistencia.',
    category: 'Transmisión y Clutch',
    price: 34.00,
    cost_price: 21.00,
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-moto-004',
    name: 'Pastillas de Freno Cerámicas EVERESTT Racing Delanteras',
    description: 'Juego de pastillas de compuesto sinterizado cerámico con disipación térmica rápida, frenado firme sin ruidos y mínimo desgaste del disco.',
    category: 'Frenos y Suspensión',
    price: 12.00,
    cost_price: 6.50,
    stock: 35,
    image_url: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=600&auto=format&fit=crop&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-moto-005',
    name: 'Juego de Amortiguadores Traseros Hidráulicos KIGCOL Pro Gas',
    description: 'Par de amortiguadores reforzados con precarga de resorte regulable y botella de nitrógeno para absorción suave en caminos difíciles y carga pesada.',
    category: 'Frenos y Suspensión',
    price: 52.00,
    cost_price: 33.00,
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&auto=format&fit=crop&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-moto-006',
    name: 'Llanta Deportiva TRX Tires 130/70-17 TL',
    description: 'Llanta para moto deportiva con compuesto de alta tracción y agarre superior en curvas tanto en asfalto seco como mojado. Marca TRX Tires original.',
    category: 'Frenos y Suspensión',
    price: 68.00,
    cost_price: 44.00,
    stock: 24,
    image_url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-moto-007',
    name: 'Batería de Gel TRX Power 12V 9Ah Sellada',
    description: 'Batería de gel libre de mantenimiento con alta potencia de arranque en frío (CCA), resistencia extrema a vibraciones y tecnología TRX Energy & Traction.',
    category: 'Eléctrico',
    price: 42.00,
    cost_price: 26.00,
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-moto-008',
    name: 'Foco Farola Delantera LED Cree H4 12V 8000LM Alta Potencia',
    description: 'Bombillo LED con lupa bifocal y disipador de aluminio aeronáutico. Luz blanca fría ultrabrillante y corte de luz antideslumbrante para conducción nocturna segura.',
    category: 'Eléctrico',
    price: 18.00,
    cost_price: 9.50,
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-moto-009',
    name: 'Casco Integral X-SPORS Carbon Racing Pro',
    description: 'Casco con certificación DOT y ECE 22.06, visor antirrayaduras con preparación Pinlock, ventilación aerodinámica de alto flujo y diseño rojo/negro deportivo.',
    category: 'Carrocería y Accesorios',
    price: 115.00,
    cost_price: 78.00,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-moto-010',
    name: 'Aceite Sintético Motul 7100 4T 10W-40 1 Litro',
    description: 'Lubricante 100% sintético con tecnología Éster para motores de 4 tiempos de alto rendimiento. Protección extrema a altas revoluciones y cambios suaves.',
    category: 'Motor',
    price: 19.50,
    cost_price: 13.00,
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1635773054018-22c7a36c53ce?w=600&auto=format&fit=crop&q=80',
    active: true,
    created_at: new Date().toISOString()
  }
];
