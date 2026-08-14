import React, { useState, useEffect } from 'react';
import EditOrderItemsModal from '../components/EditOrderItemsModal';
import InvoiceModal from '../components/InvoiceModal';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import Badge from '../../../shared/components/Badge';
import Button from '../../../shared/components/Button';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { getAdminOrders, updateAdminOrderStatus } from '../../../shared/services/dataService';
import { useToast } from '../../../shared/context/ToastContext';
import {
  Inbox,
  Edit3,
  FileCheck2,
  XCircle,
  Clock,
  User,
  Calendar,
  RefreshCw,
  Search,
  CheckCircle2,
  Wrench
} from 'lucide-react';

export default function ReceiveOrdersPage() {
  const { success, error, info } = useToast();
  const [adminOrders, setAdminOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modales
  const [editingOrder, setEditingOrder] = useState(null);
  const [invoicingOrder, setInvoicingOrder] = useState(null);
  const [cancelingOrderId, setCancelingOrderId] = useState(null);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders();
      setAdminOrders(data || []);
    } catch (e) {
      error('Error al cargar pedidos del admin: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceOrder = async (adminOrderId) => {
    try {
      const res = await updateAdminOrderStatus(adminOrderId, 'facturado');
      if (res.success) {
        success('¡Pedido Facturado con Éxito! Factura generada y stock de repuestos descontado.');
        setInvoicingOrder(null);
        if (res.invoice) {
          setGeneratedInvoice(res.invoice);
        }
        loadOrders();
      }
    } catch (e) {
      error('Error al facturar pedido: ' + e.message);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelingOrderId) return;
    try {
      await updateAdminOrderStatus(cancelingOrderId, 'cancelado');
      info('Pedido de repuestos cancelado.');
      setCancelingOrderId(null);
      loadOrders();
    } catch (e) {
      error('Error al cancelar pedido: ' + e.message);
    }
  };

  const filteredOrders = adminOrders.filter(ao => {
    const matchesStatus = statusFilter === 'todos' ? true : ao.status === statusFilter;
    const matchesSearch = searchQuery.trim()
      ? (ao.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
         ao.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (ao.seller_name && ao.seller_name.toLowerCase().includes(searchQuery.toLowerCase())))
      : true;
    return matchesStatus && matchesSearch;
  });

  const countPending = adminOrders.filter(o => o.status === 'pendiente').length;
  const countInvoiced = adminOrders.filter(o => o.status === 'facturado').length;
  const countCancelled = adminOrders.filter(o => o.status === 'cancelado').length;

  return (
    <div className="space-y-8">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-racing text-slate-100 flex items-center gap-2.5">
            <Inbox className="w-7 h-7 text-cyan-400" />
            Recibir Pedidos de Vendedores (Despacho Central)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sport">
            Órdenes de repuestos y accesorios transferidas. Ajusta cantidades por stock en tienda, cancela o factura con emisión de PDF.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0d1424] border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors cursor-pointer font-sport uppercase tracking-wider"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          Refrescar Lista
        </button>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sport">
        <button
          onClick={() => setStatusFilter('pendiente')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer
            ${statusFilter === 'pendiente'
              ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-900/20'
              : 'bg-[#0d1424]/70 border-slate-800 hover:border-slate-700'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Por Facturar (Pendientes)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-slate-100 mt-2 font-mono">{countPending}</p>
          <span className="text-[11px] text-slate-400 block mt-0.5">Listos para revisión y facturación</span>
        </button>

        <button
          onClick={() => setStatusFilter('facturado')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer
            ${statusFilter === 'facturado'
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-900/20'
              : 'bg-[#0d1424]/70 border-slate-800 hover:border-slate-700'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Facturados (Completados)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-slate-100 mt-2 font-mono">{countInvoiced}</p>
          <span className="text-[11px] text-slate-400 block mt-0.5">Con comprobante PDF generado</span>
        </button>

        <button
          onClick={() => setStatusFilter('cancelado')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer
            ${statusFilter === 'cancelado'
              ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-900/20'
              : 'bg-[#0d1424]/70 border-slate-800 hover:border-slate-700'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Cancelados</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-slate-100 mt-2 font-mono">{countCancelled}</p>
          <span className="text-[11px] text-slate-400 block mt-0.5">Anulados por falta de stock u otro</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-sport">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por N° de pedido, cliente o vendedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1424] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['todos', 'pendiente', 'facturado', 'cancelado'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all uppercase tracking-wider
                ${statusFilter === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-[#0d1424] text-slate-400 hover:text-white border border-slate-800'
                }
              `}
            >
              {tab === 'todos' ? 'Todos' : tab === 'pendiente' ? 'Pendientes' : tab === 'facturado' ? 'Facturados' : 'Cancelados'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Pedidos de Admin */}
      {loading ? (
        <LoadingSpinner text="Cargando pedidos de repuestos para el Administrador..." />
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-[#0d1424]/40 rounded-2xl border border-slate-800 p-8 font-sport">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No hay pedidos en esta sección</h3>
          <p className="text-xs text-slate-400 mt-1">
            Los pedidos aparecerán aquí automáticamente una vez que el vendedor los marque como "Enviados".
          </p>
        </div>
      ) : (
        <div className="space-y-4 font-sport">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'pendiente';
            const isInvoiced = order.status === 'facturado';
            const isCancelled = order.status === 'cancelado';

            return (
              <div
                key={order.id}
                className="bg-[#0d1424]/90 rounded-2xl border border-slate-800 p-5 hover:border-cyan-500/40 transition-all shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Información General */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-cyan-400">
                      {order.order_number}
                    </span>
                    <Badge
                      variant={
                        isInvoiced ? 'invoiced' :
                        isCancelled ? 'cancelled' : 'pending'
                      }
                      size="sm"
                    >
                      {order.status.toUpperCase()}
                    </Badge>
                    {order.edited_by_admin && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                        Cantidades Ajustadas por Admin
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cliente: <strong>{order.client_name}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Vendedor:</span>
                      <strong className="text-cyan-400">{order.seller_name}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(order.reception_date || order.created_at).toLocaleString('es-ES')}</span>
                    </div>
                  </div>

                  {/* Detalle de items de repuestos */}
                  <div className="bg-[#080d18] rounded-xl p-3 border border-slate-800 max-w-2xl space-y-1">
                    {order.items && order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-300">
                        <span>
                          <strong className="text-cyan-400 font-mono">
                            {it.adjusted_quantity !== undefined ? it.adjusted_quantity : it.quantity}x
                          </strong> {it.product_name || it.name}
                          {it.adjusted_quantity !== it.original_quantity && it.original_quantity && (
                            <span className="text-red-400 text-[10px] ml-1.5 font-bold">
                              (orig: {it.original_quantity})
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-slate-400">
                          C${Number(it.subtotal || ((it.adjusted_quantity || it.quantity || 1) * (it.unit_price || 0))).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totales y Botones de Acción */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block font-sport">
                      Total a Facturar
                    </span>
                    <span className="text-2xl font-black text-cyan-400 font-mono">
                      C${Number(order.adjusted_total || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Acciones si está PENDIENTE */}
                  {isPending && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit3}
                        onClick={() => setEditingOrder(order)}
                        title="Ajustar cantidades si falta stock"
                        className="font-sport uppercase tracking-wider"
                      >
                        Ajustar Stock
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        icon={XCircle}
                        onClick={() => setCancelingOrderId(order.id)}
                        className="font-sport uppercase tracking-wider"
                      >
                        Cancelar
                      </Button>

                      <Button
                        variant="soza"
                        size="sm"
                        icon={FileCheck2}
                        onClick={() => setInvoicingOrder(order)}
                        className="font-sport uppercase tracking-wider font-bold"
                      >
                        Facturar Pedido
                      </Button>
                    </div>
                  )}

                  {isInvoiced && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-sport">
                        <CheckCircle2 className="w-4 h-4" /> Facturado
                      </span>
                    </div>
                  )}

                  {isCancelled && (
                    <span className="text-xs text-red-400 font-bold bg-red-950/60 px-3 py-1.5 rounded-xl border border-red-500/30 font-sport">
                      Pedido Anulado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Editar Cantidades */}
      <EditOrderItemsModal
        isOpen={Boolean(editingOrder)}
        onClose={() => setEditingOrder(null)}
        adminOrder={editingOrder}
        onSaveSuccess={loadOrders}
      />

      {/* Confirmar Facturación */}
      <ConfirmDialog
        isOpen={Boolean(invoicingOrder)}
        onClose={() => setInvoicingOrder(null)}
        onConfirm={() => handleInvoiceOrder(invoicingOrder?.id)}
        title={`¿Facturar Pedido ${invoicingOrder?.order_number}?`}
        message={`Esta acción marcará el pedido como FACTURADO, generará automáticamente la factura oficial en PDF con membrete de REPUESTOS SOZA y descontará el inventario.`}
        confirmText="Confirmar y Facturar"
        variant="primary"
      />

      {/* Confirmar Cancelación */}
      <ConfirmDialog
        isOpen={Boolean(cancelingOrderId)}
        onClose={() => setCancelingOrderId(null)}
        onConfirm={handleCancelOrder}
        title="¿Cancelar este Pedido de Repuestos?"
        message="El pedido quedará registrado en estado CANCELADO en la administración."
        confirmText="Sí, Cancelar Pedido"
        variant="danger"
      />

      {/* Visor de Factura */}
      <InvoiceModal
        isOpen={Boolean(generatedInvoice)}
        onClose={() => setGeneratedInvoice(null)}
        invoice={generatedInvoice}
      />
    </div>
  );
}
