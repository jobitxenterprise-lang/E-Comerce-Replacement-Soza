import React, { useState } from 'react';
import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Button';
import { ShoppingBag, Zap, Send, Plus, Minus, CheckCircle } from 'lucide-react';
import { useCart } from '../../../shared/context/CartContext';
import { useToast } from '../../../shared/context/ToastContext';

export default function ProductDetailModal({ product, isOpen, onClose, onDirectCheckout }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { success } = useToast();

  if (!product) return null;

  const isOutOfStock = Number(product.stock || 0) <= 0;
  const maxAvailable = Number(product.stock || 1);
  const unitPrice = Number(product.price || 0);
  const calculatedTotal = unitPrice * quantity;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    success(`${quantity}x "${product.name}" agregado a tu lista.`);
    onClose();
    setQuantity(1);
  };

  const handleSendOrderDirect = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    onClose();
    setQuantity(1);
    if (onDirectCheckout) {
      onDirectCheckout();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`Categoría: ${product.category} • Repuestos SOZA Matagalpa`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 font-sport">
        
        {/* Precio y Stock 
        <div className="bg-[#080d18] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
              Precio Unitario
            </span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
              ${unitPrice.toFixed(2)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
              Disponibilidad
            </span>
            {isOutOfStock ? (
              <span className="text-xs font-bold text-red-400">Agotado en Tienda</span>
            ) : (
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {product.stock} unidades en stock
              </span>
            )}
          </div>
        </div>*/}
        

        {/* Descripción del Repuesto */}
        

        {/* Selector de Cantidad */}
        {!isOutOfStock && (
          <div className="bg-[#0d1424] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                Cantidad a Pedir
              </span>
              
            </div>

            <div className="flex items-center border border-slate-700 bg-[#070b12] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-bold cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min="1"
                max={maxAvailable}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    setQuantity(Math.min(maxAvailable, Math.max(1, val)));
                  }
                }}
                className="w-14 bg-transparent text-cyan-300 font-black text-center py-1.5 text-sm focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setQuantity(q => Math.min(maxAvailable, q + 1))}
                className="px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Resumen Total */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Total por {quantity} unidad(es):
          </span>
          <span className="text-2xl font-black text-cyan-400 font-mono">
            ${calculatedTotal.toFixed(2)} USD
          </span>
        </div>

        {/* Acciones */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <Button
            variant="secondary"
            className="w-full sm:w-1/2 font-sport text-xs"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            icon={ShoppingBag}
          >
            Añadir a Carrito
          </Button>

         
        </div>
      </div>
    </Modal>
  );
}
