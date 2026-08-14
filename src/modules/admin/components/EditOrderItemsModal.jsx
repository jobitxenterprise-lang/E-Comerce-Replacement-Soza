import React, { useState, useEffect } from 'react';
import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Button';
import { updateAdminOrderItems } from '../../../shared/services/dataService';
import { useToast } from '../../../shared/context/ToastContext';
import { Edit3, AlertCircle, Save, Plus, Minus } from 'lucide-react';

export default function EditOrderItemsModal({
  isOpen,
  onClose,
  adminOrder,
  onSaveSuccess
}) {
  const { success, error } = useToast();
  const [items, setItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

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
      prev.map(it => (it.id === itemId ? { ...it, adjusted_quantity: qty } : it))
    );
  };

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

        {/* Lista de Items Responsiva (Adaptada para Teléfonos y Tablets) */}
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
                  <span>Precio Unit: <strong className="text-cyan-400 font-mono">${Number(item.unit_price || 0).toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Control de Cantidad Ajustada */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                <div className="flex items-center border border-slate-700 bg-[#070b12] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(item.id, (item.adjusted_quantity || 0) - 1)}
                    className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-bold cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={item.adjusted_quantity}
                    onChange={(e) => handleQtyChange(item.id, e.target.value)}
                    className="w-14 bg-transparent text-cyan-300 font-black text-center py-1 text-xs focus:outline-none font-mono"
                  />

                  <button
                    type="button"
                    onClick={() => handleQtyChange(item.id, (item.adjusted_quantity || 0) + 1)}
                    className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">Subtotal</span>
                  <span className="text-sm font-black text-cyan-400 font-mono">
                    ${(Number(item.adjusted_quantity || 0) * Number(item.unit_price || 0)).toFixed(2)}
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
              ${Number(adminOrder.adjusted_total || 0).toFixed(2)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-cyan-400 font-bold block uppercase tracking-wider font-sport">Total Ajustado Final:</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">
              ${calculatedTotal.toFixed(2)} USD
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
