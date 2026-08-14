-- ==============================================================================
-- SCHEMA SQL COMPLETO: REPUESTOS SOZA — MATAGALPA, NICARAGUA
-- Compatible con Supabase PostgreSQL
-- Incluye: Repuestos de Motos, Vendedores, Administradores, Pedidos (Vendedor/Público),
--          Pedidos Admin (Edición de cantidades), Detalle, Facturas, Configuración,
--          Funciones RPC, Políticas RLS y Datos Semilla Oficiales.
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
-- 2. TABLA DE PRODUCTOS / REPUESTOS DE MOTO
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Llantas & Neumáticos',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TABLA DE VENDEDORES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sellers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. TABLA DE ADMINISTRADORES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Administrador General',
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
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo en company_settings" ON public.company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en sellers" ON public.sellers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en admins" ON public.admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en admin_orders" ON public.admin_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en admin_order_items" ON public.admin_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 12. DATOS SEMILLA (SEED DATA)
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

INSERT INTO public.admins (id, username, password, email, name)
VALUES (
  'adm-0001',
  'admin',
  'admin123',
  'admin@repuestosoza.com',
  'Administrador SOZA'
) ON CONFLICT (username) DO NOTHING;

INSERT INTO public.sellers (id, name, username, password, phone, active)
VALUES 
  ('sel-0001', 'Carlos Mendoza', 'carlosm', 'vendedor123', '+505 8899-1122', true),
  ('sel-0002', 'Valeria Gómez', 'valeriag', 'vendedor123', '+505 8765-4321', true),
  ('sel-0003', 'Mateo Morales', 'mateom', 'vendedor123', '+505 8123-4567', true),
  ('sel-0004', 'Sofía Castillo', 'sofiac', 'vendedor123', '+505 8990-2345', true)
ON CONFLICT (username) DO NOTHING;

INSERT INTO public.products (id, name, description, category, price, cost_price, stock, image_url, active)
VALUES
  (
    'prod-0001',
    'Llanta Deportiva TRX Tires 130/70-17 TL',
    'Llanta para moto deportiva con compuesto de alta tracción y agarre superior en curvas tanto en asfalto seco como mojado. Marca TRX Tires original.',
    'Llantas & Neumáticos',
    68.00,
    44.00,
    24,
    'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    'prod-0002',
    'Casco Integral X-SPORS Carbon Racing Pro',
    'Casco con certificación DOT y ECE 22.06, visor antirrayaduras con preparación Pinlock, ventilación aerodinámica de alto flujo y diseño rojo/negro deportivo.',
    'Cascos & Protección',
    115.00,
    78.00,
    15,
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    'prod-0003',
    'Batería de Gel TRX Power 12V 9Ah Sellada',
    'Batería de gel libre de mantenimiento con alta potencia de arranque en frío (CCA), resistencia extrema a vibraciones y tecnología TRX Energy & Traction.',
    'Baterías & Eléctrico',
    42.00,
    26.00,
    30,
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    'prod-0004',
    'Kit de Cilindro y Pistón EVERESTT Motor Tech 150cc OEM',
    'Kit completo de reparación de motor con cilindro rectificado de alta resistencia térmica, pistón reforzado, aros japoneses y empaquetadura completa.',
    'Repuestos de Motor & OEM',
    58.00,
    36.00,
    18,
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    'prod-0005',
    'Kit de Arrastre Reforzado KIGCOL 428H (Catalina + Piñón + Cadena)',
    'Kit de tracción con tratamiento térmico endurecido para máxima durabilidad, piñón y catalina de acero al carbono 1045 con cadena dorada de alta resistencia.',
    'Kit de Arrastre & Cadenas',
    34.00,
    21.00,
    25,
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    'prod-0006',
    'Carburador Racing KIGCOL PE28 con Cortina Plana',
    'Carburador de alto desempeño para motos 150cc a 250cc. Respuesta instantánea al acelerador, fácil calibración y óptimo flujo de mezcla combustible.',
    'Repuestos de Motor & OEM',
    46.00,
    29.00,
    14,
    'https://images.unsplash.com/photo-1580983218765-f663bec07b37?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    'prod-0007',
    'Juego de Amortiguadores Traseros Hidráulicos KIGCOL Pro Gas',
    'Par de amortiguadores reforzados con precarga de resorte regulable y botella de nitrógeno para absorción suave en caminos difíciles y carga pesada.',
    'Frenos & Suspensión',
    52.00,
    33.00,
    12,
    'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    'prod-0008',
    'Foco Farola Delantera LED Cree H4 12V 8000LM Alta Potencia',
    'Bombillo LED con lupa bifocal y disipador de aluminio aeronáutico. Luz blanca fría ultrabrillante y corte de luz antideslumbrante para conducción nocturna segura.',
    'Baterías & Eléctrico',
    18.00,
    9.50,
    40,
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    'prod-0009',
    'Aceite Sintético Motul 7100 4T 10W-40 1 Litro',
    'Lubricante 100% sintético con tecnología Éster para motores de 4 tiempos de alto rendimiento. Protección extrema a altas revoluciones y cambios suaves.',
    'Aceites & Lubricantes',
    19.50,
    13.00,
    50,
    'https://images.unsplash.com/photo-1635773054018-22c7a36c53ce?w=600&auto=format&fit=crop&q=80',
    true
  ),
  (
    'prod-0010',
    'Pastillas de Freno Cerámicas EVERESTT Racing Delanteras',
    'Juego de pastillas de compuesto sinterizado cerámico con disipación térmica rápida, frenado firme sin ruidos y mínimo desgaste del disco.',
    'Frenos & Suspensión',
    12.00,
    6.50,
    35,
    'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=600&auto=format&fit=crop&q=80',
    true
  )
ON CONFLICT (id) DO NOTHING;
