# SOZA Alta Perfumería — Sistema de Catálogo y Gestión de Pedidos

Plataforma integral y modular desarrollada con **React 19**, **React Router DOM**, **Formik + Yup**, **Tailwind CSS** y **Supabase** para la gestión de catálogo de fragancias, atención de pedidos dividida por roles (**Público/Cliente**, **Vendedor** y **Admin**), integración con **WhatsApp prellenado (`wa.me`)** y **generación automática de facturas oficiales en PDF**.

---

## 🏛️ Arquitectura y Separación de Roles

La aplicación implementa una estructura de código limpia organizada por dominios y módulos:

```text
src/
├── app/
│   ├── App.jsx                  # Proveedores globales (Auth, Cart, Toast)
│   └── routes.jsx               # Definición centralizada con React Router DOM
├── data/
│   └── seedData.js              # Datos semilla iniciales (productos, vendedores, config)
├── modules/
│   ├── public/                  # ROL PÚBLICO / CLIENTE
│   │   ├── pages/CatalogPage.jsx
│   │   ├── components/ProductCard.jsx, CartDrawer.jsx, CheckoutModal.jsx, PublicNavbar.jsx
│   │   └── schemas/checkoutSchema.js
│   │
│   ├── seller/                  # ROL VENDEDOR
│   │   ├── pages/SellerLoginPage.jsx, SellerCatalogPage.jsx, SellerOrdersPage.jsx, SellerHistoryPage.jsx
│   │   ├── components/SellerNavbar.jsx, SellerOrderCard.jsx, WhatsAppPreviewModal.jsx
│   │   └── schemas/sellerSchemas.js
│   │
│   ├── admin/                   # ROL ADMIN
│   │   ├── pages/AdminLoginPage.jsx, AdminDashboardLayout.jsx, ReceiveOrdersPage.jsx,
│   │   │         QueryOrdersPage.jsx, AddProductPage.jsx, StockManagementPage.jsx,
│   │   │         InvoiceHistoryPage.jsx, ReportsPage.jsx, SettingsPage.jsx
│   │   ├── components/AdminSidebar.jsx, AdminNavbar.jsx, EditOrderItemsModal.jsx, InvoiceModal.jsx
│   │   └── schemas/adminSchemas.js
│   │
│   └── shared/                  # COMPONENTES Y SERVICIOS COMPARTIDOS
│       ├── components/          # Button, Input, Select, Modal, Badge, LoadingSpinner, ConfirmDialog
│       ├── context/             # AuthContext, CartContext, ToastContext
│       └── services/            # dataService, pdfService (jsPDF), excelService (XLSX), whatsappService
```

---

## 🔄 Flujo de Estados y Separación de Tablas

```
TABLA "Pedido" (vendedor/público)
[Público selecciona vendedor] ──► pendiente_recibido
                                        ↓ (vendedor marca "recibido")
                                     recibido
                                        ↓ (vendedor envía por WhatsApp wa.me)
                                     enviado  ──────► Creación automática en TABLA "PedidoAdmin"

TABLA "PedidoAdmin" (gestión del admin)
     pendiente ──(admin puede editar cantidades por stock)──┐
        ↓                                                    ↓
     facturado (genera factura PDF y descuenta stock)   cancelado
```

1. **Cliente / Público (`/`)**:
   - Navega el catálogo interactivo, busca y filtra por categoría.
   - Agrega productos al carrito.
   - En el checkout ingresa su nombre, selecciona el vendedor asignado y envía el pedido.
   - El pedido se registra en la tabla `Pedido` con estado **`pendiente_recibido`**.

2. **Vendedor (`/vendedor/*` y `/login-vendedor`)**:
   - Inicia sesión desde la vista pública o enlace de acceso.
   - **Catálogo de Venta Directa**: Permite levantar pedidos con el selector de vendedor bloqueado con su usuario.
   - **Gestión de Pedidos**:
     - Ve los pedidos asignados a él.
     - Cambia de `pendiente_recibido` a `recibido`.
     - Desde `recibido`, presiona **"Enviar Pedido"**: Genera un mensaje prellenado en WhatsApp (`wa.me`) sin imágenes para enviarlo manualmente a la empresa.
     - Al confirmar el envío, el pedido pasa a estado **`enviado`** y **se crea automáticamente en la tabla `PedidoAdmin` (estado `pendiente`)**.
   - **Historial de Ventas**: Filtro por mes, métricas de total vendido y unidades entregadas.

3. **Administrador (`/login-admin` y `/admin/*`)**:
   - **Recibir Pedidos**: Lista los pedidos en `PedidoAdmin` (`pendiente`, `facturado`, `cancelado`). Permite **ajustar cantidades por stock** (sin alterar el pedido original del vendedor), cancelar o facturar.
   - **Facturar**: Genera automáticamente la factura con numeración correlativa, genera el **PDF comercial con membrete y logo de la empresa**, y descuenta el stock de los productos.
   - **Consultar Pedidos**: Buscador y auditoría global de ambas tablas de pedidos.
   - **Agregar Producto**: Formulario con Formik + Yup para alta y edición de fragancias.
   - **Agregar Stock**: Modificación rápida de inventario con alertas de stock bajo.
   - **Historial de Facturas**: Visor modal de facturas emitidas con descarga instantánea de PDF.
   - **Reportes**: Análisis financiero mensual, métricas por vendedor y exportación a Excel (`.xlsx`).
   - **Configuración de Empresa**: Datos fiscales, RUC/NIT y teléfono central de WhatsApp.

---

## 🔑 Credenciales Iniciales de Prueba (Pre-cargadas)

### Administrador:
- **Ruta de acceso:** `/login-admin`
- **Usuario:** `admin` (o `admin@gmail.com`)
- **Contraseña:** `admin123`

### Vendedores (Precargados con contraseña `vendedor123`):
- `carlosm` — Carlos Mendoza
- `valeriag` — Valeria Gómez
- `mateom` — Mateo Morales
- `sofiac` — Sofía Castillo

---

## 🚀 Puesta en Marcha

### 1. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación se abrirá en `http://localhost:5173`.

### 2. Construir para Producción
```bash
npm run build
```

---

## 🗄️ Base de Datos Supabase (Opcional)

El script SQL completo listo para ejecutar en el SQL Editor de Supabase se encuentra en:
📁 [`schema.sql`](./schema.sql)

Si no se configuran credenciales de Supabase en `.env.local`, el sistema cuenta con un motor de almacenamiento local sincronizado de alta disponibilidad que permite probar el 100% de las funcionalidades de inmediato sin requerir conexión externa.
