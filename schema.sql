-- ==============================================================================
-- SCHEMA SQL COMPLETO: REPUESTOS SOZA — MATAGALPA, NICARAGUA
-- Compatible con Supabase PostgreSQL
-- Incluye: 5 Categorías Oficiales, 3 Vendedores con Zonas Asignadas,
--          Pedidos (Vendedor/Público), Pedidos Admin, Detalle, Facturas,
--          Funciones RPC y Políticas RLS. (Catálogo limpio listo para subir productos).
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABLA DE CONFIGURACIÓN DE LA EMPRESA
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. TABLA DE CATEGORÍAS DE PRODUCTOS (5 CATEGORÍAS OFICIALES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TABLA DE PRODUCTOS / REPUESTOS DE MOTO
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Motor',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. TABLA DE VENDEDORES (3 ASESORES CON SUS ZONAS ASIGNADAS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sellers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  zone TEXT NOT NULL DEFAULT 'Zona Centro - Norte',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. TABLA DE PEDIDOS (Manejada por Público / Vendedor)
-- Estados: 'pendiente_recibido', 'recibido', 'enviado'
-- Origen: 'publico', 'vendedor'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  seller_id TEXT REFERENCES public.sellers(id) ON DELETE SET NULL,
  order_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pendiente_recibido' CHECK (status IN ('pendiente_recibido', 'recibido', 'enviado')),
  origin TEXT NOT NULL DEFAULT 'publico' CHECK (origin IN ('publico', 'vendedor')),
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. TABLA DE DETALLE DE PEDIDOS (Order Items)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. TABLA DE GESTIÓN DEL ADMIN (PedidoAdmin)
-- Creada automáticamente cuando el vendedor pasa el pedido a 'enviado'
-- Estados: 'pendiente', 'facturado', 'cancelado'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  seller_id TEXT REFERENCES public.sellers(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  reception_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'facturado', 'cancelado')),
  adjusted_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  edited_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. TABLA DE DETALLE DE PEDIDO ADMIN (DetallePedidoAdmin)
-- Permite editar cantidades ajustadas sin alterar el pedido original del vendedor
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_order_id TEXT NOT NULL REFERENCES public.admin_orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  original_quantity INT NOT NULL DEFAULT 1,
  adjusted_quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. TABLA DE FACTURAS
-- Generada automáticamente cuando el admin marca PedidoAdmin como 'facturado'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_number TEXT NOT NULL UNIQUE,
  admin_order_id TEXT REFERENCES public.admin_orders(id) ON DELETE SET NULL,
  order_number TEXT,
  client_name TEXT NOT NULL,
  seller_name TEXT,
  invoice_date TIMESTAMPTZ DEFAULT NOW(),
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  company_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. FUNCIONES RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrease_product_stock(
  p_product_id TEXT,
  p_qty INT
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products
  SET stock = GREATEST(0, stock - p_qty)
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 11. HABILITAR RLS Y PERMISOS DE ACCESO
-- ------------------------------------------------------------------------------
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo en company_settings" ON public.company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en sellers" ON public.sellers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en admin_orders" ON public.admin_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en admin_order_items" ON public.admin_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 12. DATOS SEMILLA OFICIALES (Configuración, 5 Categorías, 3 Vendedores con Zona)
-- ------------------------------------------------------------------------------

INSERT INTO public.company_settings (key, value)
VALUES (
  'general',
  '{
    "company_name": "Repuestos SOZA",
    "tagline": "Todo en repuestos, llantas, baterías y accesorios para motocicletas",
    "ruc_nit": "J0310000889211",
    "phone": "+505 8389-8687",
    "email": "ventas@repuestosoza.com",
    "address": "De la Gasolinera Puma 2c al Norte, Matagalpa, Nicaragua",
    "city": "Matagalpa, Nicaragua",
    "whatsapp_company": "50583898687",
    "currency": "$",
    "logo_url": ""
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- LAS 5 CATEGORÍAS OFICIALES
INSERT INTO public.categories (id, name, description, active)
VALUES
  ('cat-0001', 'Motor', 'Pistones, cilindros, anillos, válvulas, carburadores, empaquetaduras y aceites 4T', true),
  ('cat-0002', 'Transmisión y Clutch', 'Catalinas, piñones, cadenas de arrastre, discos de embrague y platos', true),
  ('cat-0003', 'Frenos y Suspensión', 'Pastillas, zapatas, discos de freno, amortiguadores y llantas de alta tracción', true),
  ('cat-0004', 'Eléctrico', 'Baterías de gel selladas, bombillos LED de alta potencia, ramales y reguladores', true),
  ('cat-0005', 'Carrocería y Accesorios', 'Cascos certificados, retrovisores, manubrios, sliders y accesorios de protección', true)
ON CONFLICT (name) DO NOTHING;

-- LOS 3 ASESORES DE VENTAS CON SUS ZONAS
INSERT INTO public.sellers (id, name, username, password, zone, active)
VALUES 
  ('sel-0001', 'Carlos Mendoza', 'carlosm', 'vendedor123', 'Zona Centro - Norte', true),
  ('sel-0002', 'Valeria Gómez', 'valeriag', 'vendedor123', 'Zona Occidente', true),
  ('sel-0003', 'Mateo Morales', 'mateom', 'vendedor123', 'Zona Sur', true)
ON CONFLICT (username) DO NOTHING;
