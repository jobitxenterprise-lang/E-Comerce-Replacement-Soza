import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, Search } from 'lucide-react';

export default function CategoryFilter({ productCategories = [], selectedCategory, setSelectedCategory }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  // Cerrar al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar categorías que no sean 'Todos' (ya que 'Todas las categorías' es la primera opción fija)
  const categoriesList = productCategories.filter((c) => c !== 'Todos' && c !== 'all');

  const filtered = categoriesList.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase().trim())
  );

  const isAllSelected = selectedCategory === 'all' || selectedCategory === 'Todos' || !selectedCategory;

  return (
    <div className="relative w-full font-sport" ref={wrapperRef}>
      {/* Botón Disparador del Selector */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                   bg-[#0d1424] border border-slate-800 text-slate-100
                   text-xs font-bold uppercase tracking-wider
                   cursor-pointer transition-colors hover:bg-slate-800/80 hover:border-cyan-500/40"
      >
        <span className="flex items-center gap-2.5 truncate">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate">
            {isAllSelected ? 'Todas las categorías' : selectedCategory}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-cyan-400' : ''}`}
        />
      </button>

      {/* Menú Desplegable con Buscador */}
      {open && (
        <div
          className="absolute left-0 right-0 mt-2 z-50 bg-[#0d1424] border border-slate-800
                     rounded-xl shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl"
        >
          {/* Buscador interno */}
          <div className="p-2 border-b border-slate-800 bg-[#080d18] relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-4.5 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoría de repuesto..."
              className="w-full bg-[#0d1424] border border-slate-700/80 rounded-lg pl-8 pr-3 py-2
                         text-xs text-slate-100 placeholder-slate-500 focus:outline-none
                         focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Lista de Opciones */}
          <div className="max-h-60 overflow-y-auto py-1">
            {/* Opción Todas */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Todos');
                setOpen(false);
                setSearch('');
              }}
              className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider
                          transition-colors cursor-pointer flex items-center justify-between
                          ${isAllSelected
                            ? 'text-cyan-400 bg-cyan-500/10 border-l-2 border-cyan-400'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
            >
              <span>Todas las categorías</span>
              {isAllSelected && <span className="text-[10px] text-cyan-400 font-mono">Activo</span>}
            </button>

            {filtered.length === 0 && (
              <p className="px-4 py-3 text-xs text-slate-500 text-center">
                No se encontraron categorías
              </p>
            )}

            {filtered.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider
                              transition-colors cursor-pointer flex items-center justify-between
                              ${isSelected
                                ? 'text-cyan-400 bg-cyan-500/10 border-l-2 border-cyan-400'
                                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                              }`}
                >
                  <span className="truncate">{category}</span>
                  {isSelected && <span className="text-[10px] text-cyan-400 font-mono">Activo</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
