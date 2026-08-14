import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';

// Módulo Público
import CatalogPage from '../modules/public/pages/CatalogPage';

// Módulo Vendedor
import SellerLoginPage from '../modules/seller/pages/SellerLoginPage';
import SellerCatalogPage from '../modules/seller/pages/SellerCatalogPage';
import SellerOrdersPage from '../modules/seller/pages/SellerOrdersPage';
import SellerHistoryPage from '../modules/seller/pages/SellerHistoryPage';

// Módulo Admin
import AdminLoginPage from '../modules/admin/pages/AdminLoginPage';
import AdminDashboardLayout from '../modules/admin/pages/AdminDashboardLayout';
import ReceiveOrdersPage from '../modules/admin/pages/ReceiveOrdersPage';
import QueryOrdersPage from '../modules/admin/pages/QueryOrdersPage';
import AddProductPage from '../modules/admin/pages/AddProductPage';
import StockManagementPage from '../modules/admin/pages/StockManagementPage';
import InvoiceHistoryPage from '../modules/admin/pages/InvoiceHistoryPage';
import ReportsPage from '../modules/admin/pages/ReportsPage';
import SettingsPage from '../modules/admin/pages/SettingsPage';

// Guard para Rutas de Vendedor
function ProtectedSellerRoute({ children }) {
  const { isSellerAuthenticated } = useAuth();
  if (!isSellerAuthenticated) {
    return <Navigate to="/login-vendedor" replace />;
  }
  return children;
}

// Guard para Rutas de Admin
function ProtectedAdminRoute({ children }) {
  const { isAdminAuthenticated } = useAuth();
  if (!isAdminAuthenticated) {
    return <Navigate to="/login-admin" replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. RUTAS PÚBLICAS (CLIENTE) */}
      <Route path="/" element={<CatalogPage />} />
      <Route path="/login-vendedor" element={<SellerLoginPage />} />
      <Route path="/login-admin" element={<AdminLoginPage />} />

      {/* 2. RUTAS PROTEGIDAS DE VENDEDOR */}
      <Route
        path="/vendedor"
        element={<Navigate to="/vendedor/pedidos" replace />}
      />
      <Route
        path="/vendedor/catalogo"
        element={
          <ProtectedSellerRoute>
            <SellerCatalogPage />
          </ProtectedSellerRoute>
        }
      />
      <Route
        path="/vendedor/pedidos"
        element={
          <ProtectedSellerRoute>
            <SellerOrdersPage />
          </ProtectedSellerRoute>
        }
      />
      <Route
        path="/vendedor/historial"
        element={
          <ProtectedSellerRoute>
            <SellerHistoryPage />
          </ProtectedSellerRoute>
        }
      />

      {/* 3. RUTAS PROTEGIDAS DE ADMINISTRADOR */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminDashboardLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/recibir-pedidos" replace />} />
        <Route path="recibir-pedidos" element={<ReceiveOrdersPage />} />
        <Route path="consultar-pedidos" element={<QueryOrdersPage />} />
        <Route path="productos" element={<AddProductPage />} />
        <Route path="stock" element={<StockManagementPage />} />
        <Route path="facturas" element={<InvoiceHistoryPage />} />
        <Route path="reportes" element={<ReportsPage />} />
        <Route path="configuracion" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
