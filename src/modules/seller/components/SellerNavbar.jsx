import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { useCart } from '../../../shared/context/CartContext';
import { Zap, ShoppingBag, ClipboardList, History, LogOut, Plus  } from 'lucide-react';
import Button from '../../../shared/components/Button';
import logo from "../../public/Imagenes/logomoto.png"

export default function SellerNavbar() {
  const { currentSeller, logoutSeller } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/vendedor/catalogo', label: 'Levantar Pedido', icon: Plus },
    { to: '/vendedor/pedidos', label: 'Gestión de Pedidos', icon: ClipboardList },
    { to: '/vendedor/historial', label: 'Historial de Ventas', icon: History }
  ];

  const handleLogout = () => {
    logoutSeller();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070b12]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          
          {/* Logo Vendedor */}
          <div className="flex items-center gap-3">
              <div >
                <img src={logo} alt=""  className= ' lg:w-36  lg:h-12  w-12 h-4  '/>
              </div>
              <div>
                
                <span className="block text-[10px] text-cyan-400 font-semibold uppercase font-sport">
                  Vendedor: {currentSeller?.name} {currentSeller?.zone ? `(${currentSeller.zone})` : ''}
                </span>
              </div>
            
          </div>

          {/* Enlaces Centrales */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0d1424] p-1 rounded-xl border border-slate-800 font-sport">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider
                    ${isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-[#0d1424] border border-slate-700/80 hover:border-cyan-500 text-slate-200"
              title="Carrito para levantar pedido"
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              icon={LogOut}
              className="text-slate-400 hover:text-red-400 font-sport"
            >
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>

        {/* Móvil */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs font-sport">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg
                  ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{link.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
