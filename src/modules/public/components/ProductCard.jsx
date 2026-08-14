import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ product, onSelect }) {
  const isOutOfStock = Number(product.stock || 0) <= 0;

  return (
    <div className="bg-[#0d1424] rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
      {/* Badge de Categoría & Stock */}
      <div className="relative w-full pt-[85%] bg-[#080d18] overflow-hidden">
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          <span className="px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-lg bg-black/80 backdrop-blur-md text-cyan-300 border border-cyan-500/40 font-sport">
            {product.category}
          </span>
          {isOutOfStock ? (
            <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-red-950/90 text-red-300 border border-red-600/50 uppercase tracking-wider font-mono">
              Agotado
            </span>
          ) : product.stock <= 5 ? (
            <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-amber-950/90 text-amber-300 border border-amber-500/50 font-mono">
              Últimas {product.stock} unid.
            </span>
          ) : null}
        </div>

        {/* Imagen del Repuesto (Estática, sin hover overlay) */}
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Información del Repuesto */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-100 line-clamp-1 font-sport">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block font-sport">
              PRECIO OFERTA
            </span>
            <span className="text-xl font-black text-cyan-400 font-mono">
              ${Number(product.price || 0).toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelect && onSelect(product)}
            disabled={isOutOfStock}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-sport uppercase tracking-wider
              ${isOutOfStock 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500/15 to-blue-600/15 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/25 active:scale-95'
              }
            `}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isOutOfStock ? 'Agotado' : 'PEDIR'}
          </button>
        </div>
      </div>
    </div>
  );
}
