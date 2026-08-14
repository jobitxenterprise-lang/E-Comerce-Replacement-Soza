import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { checkoutValidationSchema } from '../schemas/checkoutSchema';
import Modal from '../../../shared/components/Modal';
import Input from '../../../shared/components/Input';
import Select from '../../../shared/components/Select';
import Button from '../../../shared/components/Button';
import { useCart } from '../../../shared/context/CartContext';
import { useToast } from '../../../shared/context/ToastContext';
import { getSellers, createOrder } from '../../../shared/services/dataService';
import { CheckCircle2, User, Send, ShoppingBag } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, defaultSellerId = '', isSellerMode = false }) {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { success, error } = useToast();
  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [orderCompleted, setOrderCompleted] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setOrderCompleted(null);
      loadSellers();
    }
  }, [isOpen]);

  const loadSellers = async () => {
    setLoadingSellers(true);
    try {
      const list = await getSellers();
      setSellers(list || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSellers(false);
    }
  };

  const sellerOptions = sellers.map(s => ({
    value: s.id,
    label: `${s.name} (${s.phone || 'Asesor SOZA'})`
  }));

  const initialValues = {
    client_name: '',
    seller_id: defaultSellerId || (sellers.length > 0 ? sellers[0].id : '')
  };

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    if (cartItems.length === 0) {
      error('Tu lista de repuestos está vacía.');
      setSubmitting(false);
      return;
    }

    try {
      const order = await createOrder({
        client_name: values.client_name,
        seller_id: values.seller_id,
        origin: isSellerMode ? 'vendedor' : 'publico',
        items: cartItems,
        notes: ''
      });

      const selectedSeller = sellers.find(s => s.id === values.seller_id);
      setOrderCompleted({
        ...order,
        sellerName: selectedSeller ? selectedSeller.name : 'Asesor de Ventas'
      });

      clearCart();
      resetForm();
      success(`¡Pedido ${order.order_number} enviado al asesor!`);
    } catch (err) {
      error('Error al procesar el pedido: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={orderCompleted ? '¡Pedido Enviado!' : 'Enviar Pedido '}
      subtitle={orderCompleted ? 'Tu pedido ha sido enviada ' : ''}
      maxWidth="max-w-xl"
    >
      {orderCompleted ? (
        /* Vista de Éxito */
        <div className="flex flex-col items-center text-center p-2 sm:p-4 font-sport">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
            Número de Pedido
          </span>
          <span className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1 mb-2 font-mono">
            {orderCompleted.order_number}
          </span>

          <div className="bg-[#080d18] rounded-2xl p-4 border border-slate-800 w-full text-left my-4 text-xs sm:text-sm space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Cliente / Taller:</span>
              <span className="font-bold text-slate-100">{orderCompleted.client_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Asesor de Ventas:</span>
              <span className="font-bold text-cyan-400">{orderCompleted.sellerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Estado Inicial:</span>
              <span className="font-semibold text-amber-400 font-mono">pendiente_recibido</span>
            </div>
            <div className="flex justify-between py-1 pt-2 text-base font-bold">
              <span className="text-slate-300">Total a Liquidar:</span>
              <span className="text-cyan-400 font-black font-mono text-lg">${Number(orderCompleted.total || 0).toFixed(2)} USD</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            Tu asesor en Matagalpa revisará la disponibilidad de los repuestos y se comunicará para el pago y entrega.
          </p>

          <Button variant="soza" size="lg" className="w-full uppercase tracking-wider font-bold" onClick={onClose}>
            Entendido / Continuar en Catálogo
          </Button>
        </div>
      ) : (
        /* Formulario Formik con exactamente 2 inputs */
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={checkoutValidationSchema}
          onSubmit={handleFormSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form className="space-y-4 font-sport">
              {/* Resumen del Pedido */}
              <div className="bg-[#080d18] rounded-2xl p-3.5 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
                    <ShoppingBag className="w-4 h-4 text-cyan-400" />
                    RESUMEN ({cartItems.length} {cartItems.length === 1 ? 'REPUESTO' : 'REPUESTOS'})
                  </span>
                  <span className="font-mono font-black text-cyan-400 text-sm sm:text-base">
                    Total: ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span className="truncate max-w-[200px] sm:max-w-[280px]">
                        <strong className="text-cyan-400 font-mono">{item.quantity}x</strong> {item.name}
                      </span>
                      <span className="font-mono text-slate-400">
                        ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* INPUT 1: Nombre */}
              <Input
                label="Nombre Completo / Taller de Moto"
                name="client_name"
                placeholder="Ej. Taller Hermanos González o Juan Pérez"
                icon={User}
                required
                value={values.client_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.client_name}
                touched={touched.client_name}
              />

              {/* INPUT 2: Seleccionar Vendedor */}
              <Select
                label="Asesor de Ventas Asignado"
                name="seller_id"
                required
                options={sellerOptions}
                disabled={isSellerMode || loadingSellers}
                value={values.seller_id}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.seller_id}
                touched={touched.seller_id}
                helperText={isSellerMode ? 'Bloqueado: Se registrará a tu nombre como vendedor.' : 'Elige el asesor que te brindará atención personalizada en Matagalpa.'}
              />

              {/* Botones de Cancelar y Enviar Pedido */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto font-sport"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="soza"
                  loading={isSubmitting}
                  icon={Send}
                  className="w-full sm:w-auto uppercase tracking-wider font-bold"
                >
                  ENVIAR PEDIDO (${totalPrice.toFixed(2)})
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </Modal>
  );
}
