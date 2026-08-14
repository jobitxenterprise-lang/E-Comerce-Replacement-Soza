import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap, User, ShieldCheck, LogIn, Menu, X, PhoneCall } from 'lucide-react';
import { useCart } from '../../../shared/context/CartContext';
import { useAuth } from '../../../shared/context/AuthContext';
import Button from '../../../shared/components/Button';
import Logo from "../Imagenes/logomoto.png"

export default function PublicNavbar({ onOpenSellerLogin }) {
  const { totalItems, setIsCartOpen } = useCart();
  const { isSellerAuthenticated, currentSeller, logoutSeller } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#070b12]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-2">
          
          {/* Logo SOZA - Con temática de Motocicleta & Robot */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            {/* Insignia / Avatar Robot */}
              <div className="w-22 h-12 bg-[#0a1120] rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden">
               <img 
               src={Logo} alt="" />
              </div>

            <div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] sm:text-[10px] tracking-[0.2em] font-extrabold uppercase text-slate-400 font-sport">
                  REPUESTOS
                </span>
                <span className="text-[8px] sm:text-[9px] px-1 py-0.1 bg-red-600 text-white font-bold rounded-sm uppercase tracking-wider">
                  MOTO
                </span>
              </div>
              <span className="font-racing text-lg sm:text-2xl font-black tracking-wider soza-gradient-text block leading-none sm:leading-tight">
                SOZA
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-widest text-cyan-400 font-semibold uppercase block">
                Matagalpa, NI
              </span>
            </div>
          </Link>

          {/* Acciones Derecha */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Botón Acceso Vendedor (Desktop) */}
            <div className="hidden sm:flex items-center gap-2">
              {isSellerAuthenticated ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/vendedor/pedidos')}
                    icon={User}
                    className="text-xs font-sport"
                  >
                    Panel Vendedor ({currentSeller?.name.split(' ')[0]})
                  </Button>
                  <button
                    onClick={logoutSeller}
                    className="text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 cursor-pointer font-sport"
                    title="Cerrar sesión de vendedor"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (onOpenSellerLogin) onOpenSellerLogin();
                    else navigate('/login-vendedor');
                  }}
                  icon={LogIn}
                  className="text-xs font-sport uppercase tracking-wider"
                >
                  Portal Vendedores
                </Button>
              )}
            </div>

            {/* Carrito de Repuestos (Siempre visible y táctil) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:p-3 rounded-xl bg-[#0d1424] border border-slate-700/80 hover:border-cyan-500/60 hover:bg-slate-800 text-slate-200 transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="Abrir Carrito de Repuestos"
            >
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-600 to-rose-500 text-white font-extrabold text-[10px] sm:text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-red-600/50 animate-pulse font-mono">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Enlace Admin (Desktop) */}
            

            {/* Toggle Menú Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl bg-[#0d1424] border border-slate-800 text-slate-300 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Desplegable Móvil */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-3 border-t border-slate-800/80 space-y-2 animate-fadeIn font-sport">
            {isSellerAuthenticated ? (
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    navigate('/vendedor/pedidos');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-between"
                >
                  <span>Panel Vendedor ({currentSeller?.name})</span>
                  <User className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    logoutSeller();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-400 font-bold hover:bg-slate-900 rounded-lg"
                >
                  Cerrar Sesión de Vendedor
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate('/login-vendedor');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-cyan-900 text-white text-xs font-bold flex items-center justify-between border border-cyan-500/30"
              >
                <span>Acceso para Vendedores</span>
                <LogIn className="w-4 h-4" />
              </button>
            )}

          
          </div>
        )}
      </div>
    </header>
  );
}
