import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { ShieldCheck, LogOut, ExternalLink, Menu, Zap } from 'lucide-react';
import Button from '../../../shared/components/Button';
import logo from "../../public/Imagenes/logomoto.png";

export default function AdminNavbar({ onToggleSidebar }) {
  const { currentAdmin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/login-admin');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070b12]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      
      {/* Botón Sidebar Móvil + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

       
         <img src={logo} alt="" className='w-16 h-8 lg:w-32 lg:h-12' />
         
        
      </div>

      {/* Acciones Derecha */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors px-3 py-1.5 rounded-lg bg-[#0d1424] border border-slate-800 font-sport"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver Catálogo Público
        </Link>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-800 font-sport">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-200 block">
              {currentAdmin?.name || 'Administrador'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {currentAdmin?.email || 'admin@repuestosoza.com'}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            icon={LogOut}
            className="text-slate-400 hover:text-red-400"
          >
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
