import React from 'react';
import Badge from '../../../shared/components/Badge';
import Button from '../../../shared/components/Button';
import { Clock, CheckCircle, Send, User, Calendar, MessageSquare, Wrench } from 'lucide-react';

export default function SellerOrderCard({
  order,
  onMarkReceived,
  onOpenWhatsApp
}) {
  const isPendingReceived = order.status === 'pendiente_recibido';
  const isReceived = order.status === 'recibido';
  const isSent = order.status === 'enviado';

  const statusBadges = {
    pendiente_recibido: <Badge variant="pending">Pendiente</Badge>,
    recibido: <Badge variant="received">Recibido</Badge>,
    enviado: <Badge variant="sent">Enviado a Despacho</Badge>
  };

  const formattedDate = order.order_date || order.created_at
    ? new Date(order.order_date || order.created_at).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div className="bg-[#0d1424]/90 rounded-2xl border border-slate-800 p-5 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-4 shadow-xl">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="font-mono text-xs font-bold text-cyan-400">
              {order.order_number}
            </span>
            <div className="flex items-center gap-2 mt-1 text-slate-200 text-sm font-bold font-sport">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{order.client_name}</span>
            </div>
          </div>
          <div>
            {statusBadges[order.status] || <Badge>{order.status}</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3 font-sport">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            {formattedDate}
          </span>
       
        </div>

        {/* Lista de Items */}
        <div className="bg-[#080d18] rounded-xl p-3 border border-slate-800 space-y-1.5 max-h-36 overflow-y-auto font-sport">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-slate-200">
                <span className="truncate max-w-[200px] text-slate-300">
                  <strong className="text-cyan-400 font-mono">{item.quantity}x</strong> {item.product_name || item.name}
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  ${Number(item.subtotal || (item.quantity * item.unit_price) || 0).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">Sin items detallados</p>
          )}
        </div>

        {order.notes && (
          <p className="mt-2 text-xs text-slate-400 bg-[#080d18]/50 p-2 rounded-lg italic">
            Obs: "{order.notes}"
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block font-sport">
            Total Liquidación
          </span>
          <span className="text-xl font-black text-cyan-400 font-mono">
            ${Number(order.total || 0).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isPendingReceived && (
            <Button
              variant="outline"
              size="sm"
              icon={CheckCircle}
              onClick={() => onMarkReceived(order.id)}
            >
              Recibido
            </Button>
          )}

          {isReceived && (
            <Button
              variant="soza"
              size="sm"
              icon={Send}
              onClick={() => onOpenWhatsApp(order)}
            >
              Enviar Pedido
            </Button>
          )}

          {isSent && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-sport">
              <CheckCircle className="w-3.5 h-3.5" />
              Pedido Enviado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
