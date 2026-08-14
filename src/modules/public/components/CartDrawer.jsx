import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight, Wrench } from 'lucide-react';
import { useCart } from '../../../shared/context/CartContext';
import Button from '../../../shared/components/Button';

export default function CartDrawer({ onProceedToCheckout }) {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sport">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-[#090e1a] border-l border-slate-800 shadow-2xl flex flex-col h-full"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#070b12]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-100 font-racing">
                      Lista de Pedido
                    </h3>
                    <span className="text-[11px] text-cyan-400 uppercase tracking-wider block">
                      Repuestos SOZA Matagalpa
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <div className="w-16 h-16 rounded-2xl bg-[#0d1424] border border-slate-800 flex items-center justify-center mb-4 text-cyan-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="text-base font-bold text-slate-200">Tu lista está vacía</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Explora el catálogo y añade llantas, cascos, baterías o repuestos para tu moto.
                    </p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-2xl bg-[#0d1424]/90 border border-slate-800/90 hover:border-cyan-500/40 transition-all shadow-md"
                    >
                      {/* Imagen */}
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-[#070b12] shrink-0 border border-slate-800"
                      />

                      {/* Detalles */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-slate-700 bg-[#070b12] rounded-xl overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-1 text-xs font-mono font-bold text-cyan-300">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-sm font-mono font-black text-cyan-400">
                            C${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {cartItems.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#070b12] space-y-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>Subtotal Repuestos</span>
                      <span className="font-mono">C${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-bold text-slate-100 pt-2 border-t border-slate-800">
                      <span>Total Estimado:</span>
                      <span className="text-cyan-400 text-xl font-black font-mono">
                        C${totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={clearCart}
                      className="text-slate-400 hover:text-red-400"
                    >
                      Vaciar
                    </Button>
                    <Button
                      variant="soza"
                      size="lg"
                      className="flex-1 uppercase tracking-wider font-bold"
                      icon={ArrowRight}
                      onClick={() => {
                        setIsCartOpen(false);
                        if (onProceedToCheckout) onProceedToCheckout();
                      }}
                    >
                      Enviar Pedido
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
