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

// Los 3 Asesores de Ventas Oficiales con sus Zonas
export const initialSellers = [
  {
    id: 'sel-0001',
    name: 'Carlos Mendoza',
    username: 'carlosm',
    password: 'vendedor123',
    zone: 'Zona Centro - Norte',
    active: true
  },
  {
    id: 'sel-0002',
    name: 'Valeria Gómez',
    username: 'valeriag',
    password: 'vendedor123',
    zone: 'Zona Occidente',
    active: true
  },
  {
    id: 'sel-0003',
    name: 'Mateo Morales',
    username: 'mateom',
    password: 'vendedor123',
    zone: 'Zona Sur',
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

export const initialProducts = [];
