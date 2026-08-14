import React, { useState } from 'react';
import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Button';
import { formatWhatsAppMessage, generateWhatsAppUrl } from '../../../shared/services/whatsappService';
import { Send, CheckCircle2, MessageSquare, ExternalLink, Copy, Check } from 'lucide-react';
import { useToast } from '../../../shared/context/ToastContext';

export default function WhatsAppPreviewModal({
  isOpen,
  onClose,
  order,
  companyPhone = '',
  onConfirmSent
}) {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) return null;

  const targetPhone = companyPhone || import.meta.env.VITE_WHATSAPP_NUMBER || '50583898687';

  const messageText = formatWhatsAppMessage({
    orderNumber: order.order_number,
    clientName: order.client_name,
    sellerName: order.seller_name || order.seller?.name || 'Vendedor',
    date: order.order_date || order.created_at,
    items: order.items || [],
    total: order.total,
    notes: order.notes
  });

  const whatsappUrl = generateWhatsAppUrl(targetPhone, messageText);

  const handleCopyText = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    success('Mensaje copiado al portapapeles');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
  };

  const handleConfirmAndAdvance = async () => {
    setIsSubmitting(true);
    try {
      if (onConfirmSent) {
        await onConfirmSent(order.id);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar Pedido a la Empresa por WhatsApp"
      subtitle="Generación de mensaje prellenado sin imágenes para el despacho central"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Destinatario */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Destino (WhatsApp Central Empresa):</span>
          </div>
          <span className="font-mono font-bold text-amber-400">
            +{targetPhone}
          </span>
        </div>

        {/* Vista previa del mensaje */}
        <div className="relative">
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Vista previa del mensaje prellenado:
          </label>
          <pre className="bg-[#0e1626] border border-slate-700/80 p-4 rounded-xl text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto selection:bg-amber-500 selection:text-black">
            {messageText}
          </pre>
          <button
            onClick={handleCopyText}
            className="absolute top-8 right-3 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-[11px] text-slate-300 flex items-center gap-1 border border-slate-700 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        {/* Pasos */}
        <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-300 space-y-1.5">
          <p className="font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Flujo de confirmación:
          </p>
          <p className="text-slate-400 pl-5 text-[11px]">
            1. Haz clic en <strong>"Abrir WhatsApp"</strong> para enviar el pedido al número central de la empresa.
          </p>
          <p className="text-slate-400 pl-5 text-[11px]">
            2. Haz clic en <strong>"Confirmar Envío y Pasar a Enviado"</strong> para que el sistema cree automáticamente el registro en la tabla del Administrador para su posterior facturación.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleOpenWhatsApp}
            icon={ExternalLink}
            className="w-full sm:w-auto"
          >
            Abrir WhatsApp
          </Button>
          <Button
            variant="gold"
            onClick={handleConfirmAndAdvance}
            loading={isSubmitting}
            icon={Send}
            className="w-full sm:w-auto"
          >
            Confirmar Envío (Pasar a Enviado)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
