import React, { useState, useEffect } from 'react';
import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Button';
import { updateAdminOrderItems, getProducts } from '../../../shared/services/dataService';
import { useToast } from '../../../shared/context/ToastContext';
import { Edit3, AlertCircle, Save, Plus, Minus, Search, PackagePlus } from 'lucide-react';

export default function EditOrderItemsModal({
  isOpen,
  onClose,
  adminOrder,
  onSaveSuccess
}) {
  const { success, error } = useToast();
  const [items, setItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setAllProducts(data || []);
    } catch (e) {
      console.warn('Error loading products', e);
    }
  };

  useEffect(() => {
    if (adminOrder && adminOrder.items) {
      setItems(
        adminOrder.items.map(item => ({
          ...item,
          adjusted_quantity: item.adjusted_quantity !== undefined ? item.adjusted_quantity : item.quantity
        }))
      );
    }
  }, [adminOrder]);

  if (!adminOrder) return null;

  const handleQtyChange = (itemId, newQty) => {
    const qty = Math.max(0, parseInt(newQty, 10) || 0);
    setItems(prev =>
      prev.map(it => (it.id === itemId || it.product_id === itemId ? { ...it, adjusted_quantity: qty } : it))
    );
  };

  const handleAddProduct = (product) => {
    const exists = items.find(it => it.product_id === product.id);
    if (exists) {
      handleQtyChange(exists.id || exists.product_id, (exists.adjusted_quantity || 0) + 1);
    } else {
      setItems(prev => [
        ...prev,
        {
          id: 'new-' + Date.now(),
          product_id: product.id,
          product_name: product.name,
          original_quantity: 0,
          adjusted_quantity: 1,
          quantity: 1,
          unit_price: product.price,
          subtotal: product.price
        }
      ]);
    }
    setProductSearch('');
  };

  const searchResults = productSearch.trim()
    ? allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    : [];

  const calculatedTotal = items.reduce(
    (sum, it) => sum + (Number(it.adjusted_quantity || 0) * Number(it.unit_price || 0)),
    0
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAdminOrderItems(adminOrder.id, items);
      success('Cantidades ajustadas guardadas en la administración.');
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (e) {
      error('Error al guardar ajustes: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ajuste de Stock — Pedido ${adminOrder.order_number}`}
      subtitle="Modifica las unidades asignadas según el stock real en tienda antes de facturar. El pedido original del vendedor permanecerá intacto."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 font-sport">
        {/* Alerta */}
        <div className="bg-[#0b1528] border border-cyan-500/30 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-cyan-200">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            Esta edición ajusta únicamente la orden de despacho del Admin. Si no hay suficiente existencia de un repuesto, ajusta la cantidad aquí antes de generar la factura PDF.
          </span>
        </div>



        {/* Buscador para Añadir Nuevos Productos */}
        <div className="relative z-10">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Añadir más productos al pedido
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full bg-[#080d18] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {productSearch.trim() && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-[#0d1424] border border-slate-700 rounded-xl shadow-2xl z-20">
              {searchResults.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-800 border-b border-slate-800/50 flex justify-between items-center transition-colors"
                >
                  <span className="text-sm font-bold text-slate-200">{product.name}</span>
                  <span className="text-xs font-mono text-cyan-400">C${Number(product.price).toFixed(2)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Items Responsiva */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#080d18] border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-100 text-sm block truncate">
                  {item.product_name || item.name}
                </span>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Cant. Original Vendedor: <strong className="text-slate-200 font-mono">{item.original_quantity || item.quantity || 1}</strong></span>
                  <span>Precio Unit: <strong className="text-cyan-400 font-mono">C${Number(item.unit_price || 0).toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Control de Cantidad Ajustada */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                <div className="flex items-center border border-slate-700 bg-[#070b12] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(item.id || item.product_id, (item.adjusted_quantity || 0) - 1)}
                    className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-bold cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={item.adjusted_quantity}
                    onChange={(e) => handleQtyChange(item.id || item.product_id, e.target.value)}
                    className="w-14 bg-transparent text-cyan-300 font-black text-center py-1 text-xs focus:outline-none font-mono"
                  />

                  <button
                    type="button"
                    onClick={() => handleQtyChange(item.id || item.product_id, (item.adjusted_quantity || 0) + 1)}
                    className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">Subtotal</span>
                  <span className="text-sm font-black text-cyan-400 font-mono">
                    C${(Number(item.adjusted_quantity || 0) * Number(item.unit_price || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen y Totales */}
        <div className="bg-[#0d1424] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-sport">Total Original Pedido:</span>
            <span className="text-sm font-semibold text-slate-400 line-through font-mono">
              C${Number(adminOrder.adjusted_total || 0).toFixed(2)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-cyan-400 font-bold block uppercase tracking-wider font-sport">Total Ajustado Final:</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">
              C${calculatedTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="soza"
            onClick={handleSave}
            loading={isSaving}
            icon={Save}
            className="w-full sm:w-auto uppercase tracking-wider font-bold"
          >
            Guardar Ajustes de Stock
          </Button>
        </div>
      </div>
    </Modal>
  );
}
