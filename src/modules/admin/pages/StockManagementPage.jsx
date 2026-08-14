import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import Button from '../../../shared/components/Button';
import { getProducts, updateProductStock } from '../../../shared/services/dataService';
import { useToast } from '../../../shared/context/ToastContext';
import { Layers, AlertTriangle, Search, RefreshCw, Plus, Minus, Save, Wrench } from 'lucide-react';

export default function StockManagementPage() {
  const { success, error } = useToast();
  const [products, setProducts] = useState([]);
  const [stockChanges, setStockChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
      const initialStock = {};
      data.forEach(p => {
        initialStock[p.id] = p.stock || 0;
      });
      setStockChanges(initialStock);
    } catch (e) {
      error('Error al cargar inventario: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStockDelta = (productId, delta) => {
    setStockChanges(prev => {
      const current = prev[productId] !== undefined ? prev[productId] : 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleStockInput = (productId, val) => {
    const parsed = Math.max(0, parseInt(val, 10) || 0);
    setStockChanges(prev => ({ ...prev, [productId]: parsed }));
  };

  const handleSaveStock = async (productId) => {
    setSavingId(productId);
    try {
      const newStock = stockChanges[productId] || 0;
      await updateProductStock(productId, newStock);
      success('Stock de repuesto actualizado correctamente.');
      loadProducts();
    } catch (e) {
      error('Error al actualizar existencias: ' + e.message);
    } finally {
      setSavingId(null);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = products.filter(p => Number(p.stock) <= 5).length;

  return (
    <div className="space-y-6 font-sport">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-racing text-slate-100 flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-cyan-400" />
            Control Rápido de Stock en Tienda
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Actualiza existencias de llantas, pistones, baterías y repuestos en el almacén de Matagalpa.
          </p>
        </div>

        <button
          onClick={loadProducts}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0d1424] border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors cursor-pointer uppercase tracking-wider"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          Refrescar Inventario
        </button>
      </div>

      {/* Alerta de Stock Bajo */}
      {lowStockCount > 0 && (
        <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-red-300 font-bold">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>
              Atención: Existen <strong>{lowStockCount}</strong> repuesto(s) con stock crítico (5 o menos unidades disponibles).
            </span>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filtrar por repuesto, llanta o categoría..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0d1424] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Tabla Responsiva */}
      {loading ? (
        <LoadingSpinner text="Cargando inventario de repuestos..." />
      ) : (
        <div className="bg-[#0d1424]/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080d18] text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Repuesto / Modelo</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4 text-center">Stock Actual BD</th>
                  <th className="p-4 text-center">Ajustar Existencia</th>
                  <th className="p-4 text-right">Guardar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((p) => {
                  const currentValue = stockChanges[p.id] !== undefined ? stockChanges[p.id] : p.stock;
                  const hasChanged = currentValue !== p.stock;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80'}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover bg-[#070b12]"
                          />
                          <div>
                            <span className="font-bold text-slate-100 block">{p.name}</span>
                            <span className="text-[11px] text-cyan-400 font-mono font-bold">${Number(p.price || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        {p.category}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-mono
                            ${Number(p.stock) <= 0
                              ? 'bg-red-950 text-red-300 border border-red-600/40'
                              : Number(p.stock) <= 5
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            }
                          `}
                        >
                          {p.stock} unid.
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => handleStockDelta(p.id, -1)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentValue}
                            onChange={(e) => handleStockInput(p.id, e.target.value)}
                            className="w-16 sm:w-20 bg-[#070b12] border border-slate-700 text-center font-bold text-cyan-300 rounded-lg py-1 px-1.5 text-xs focus:outline-none font-mono"
                          />

                          <button
                            onClick={() => handleStockDelta(p.id, 1)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleStockDelta(p.id, 10)}
                            className="px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold hover:bg-cyan-500/20 cursor-pointer font-mono"
                            title="Sumar lote de 10"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant={hasChanged ? 'soza' : 'secondary'}
                          size="sm"
                          icon={Save}
                          loading={savingId === p.id}
                          disabled={!hasChanged}
                          onClick={() => handleSaveStock(p.id)}
                          className="font-sport uppercase tracking-wider"
                        >
                          Guardar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
