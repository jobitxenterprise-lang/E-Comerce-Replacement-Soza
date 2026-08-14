import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Inbox,
  Search,
  PlusCircle,
  Layers,
  FileText,
  BarChart3,
  Settings,
  X
} from 'lucide-react';

export default function AdminSidebar({ isOpen, onClose }) {
  const menuItems = [
    { to: '/admin/recibir-pedidos', label: 'Pedidos', icon: Inbox },
    { to: '/admin/consultar-pedidos', label: 'Consultar Pedidos', icon: Search },
    { to: '/admin/productos', label: 'Agregar producto', icon: PlusCircle },
    { to: '/admin/stock', label: 'Stock', icon: Layers },
    { to: '/admin/facturas', label: 'Historial Facturas', icon: FileText },
    { to: '/admin/reportes', label: 'Reportes y Ventas', icon: BarChart3 },
    { to: '/admin/configuracion', label: 'Configuración Empresa', icon: Settings }
  ];

  return (
    <>
      {/* Backdrop Móvil */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-[#070b12]/98 border-r border-slate-800 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 font-sport
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 uppercase tracking-wider
                  ${isActive
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-red-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#0d1424]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/50 text-cyan-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#05080e] text-center font-sport">
          <p className="text-[11px] text-slate-500">
            Repuestos SOZA • Matagalpa, NI
          </p>
        </div>
      </aside>
    </>
  );
}
