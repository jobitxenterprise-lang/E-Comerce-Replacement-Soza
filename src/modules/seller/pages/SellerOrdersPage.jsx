import React, { useState, useEffect } from 'react';
import SellerNavbar from '../components/SellerNavbar';
import SellerOrderCard from '../components/SellerOrderCard';
import EditOrderItemsModal from '../../admin/components/EditOrderItemsModal';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { useAuth } from '../../../shared/context/AuthContext';
import { useToast } from '../../../shared/context/ToastContext';
import { getOrdersBySeller, updateOrderStatus, getCompanySettings, softDeleteOrder, updateOrderItems } from '../../../shared/services/dataService';
import { formatWhatsAppMessage, generateWhatsAppUrl } from '../../../shared/services/whatsappService';
import { ClipboardList, Search, CheckCircle2, Clock, Send, RefreshCw, Wrench } from 'lucide-react';

export default function SellerOrdersPage() {
  const { currentSeller } = useAuth();
  const { success, error } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pendientes');
  const [searchQuery, setSearchQuery] = useState('');
  const [companySettings, setCompanySettings] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    if (currentSeller?.id) {
      loadData();
    }
  }, [currentSeller]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, settingsData] = await Promise.all([
        getOrdersBySeller(currentSeller.id),
        getCompanySettings()
      ]);
      setOrders(ordersData || []);
      setCompanySettings(settingsData);
    } catch (e) {
      error('Error al cargar pedidos: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReceived = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'recibido');
      success('Pedido de repuestos marcado como "Recibido". Ahora puedes enviarlo al despacho central por WhatsApp.');
      loadData();
    } catch (e) {
      error('Error al actualizar estado: ' + e.message);
    }
  };

  const handleConfirmSent = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'enviado');
      success('¡Pedido de repuestos enviado exitosamente a la empresa! Ha sido registrado en el panel de Administración.');
      loadData();
    } catch (e) {
      error('Error al transferir pedido al admin: ' + e.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) return;
    try {
      await softDeleteOrder(orderId, currentSeller.id, 'seller', 'ORDER');
      success('Pedido eliminado correctamente.');
      loadData();
    } catch (e) {
      error('Error al eliminar: ' + e.message);
    }
  };

  const handleSaveEdit = async (orderId, items) => {
    try {
      await updateOrderItems(orderId, items);
      success('Pedido actualizado correctamente.');
      setEditingOrder(null);
      loadData();
    } catch (e) {
      error('Error al actualizar pedido: ' + e.message);
    }
  };

  const handleSendWhatsAppDirectly = async (order) => {
    try {
      const msg = formatWhatsAppMessage({
        orderNumber: order.order_number,
        clientName: order.client_name,
        sellerName: order.seller?.name || currentSeller?.name || 'Vendedor',
        date: order.order_date || order.created_at,
        items: order.items || [],
        total: order.total,
        notes: order.notes
      });
      const phone = companySettings?.whatsapp_company || import.meta.env.VITE_WHATSAPP_NUMBER;
      const url = generateWhatsAppUrl(phone, msg);
      
      window.open(url, '_blank');
      
      // Pasar el pedido a enviado automáticamente
      await handleConfirmSent(order.id);
    } catch (e) {
      error('Error al enviar por WhatsApp: ' + e.message);
    }
  };

  // Filtrado
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'todos' ? true : order.status === statusFilter;
    const matchesSearch = searchQuery.trim()
      ? (order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
         order.client_name.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesStatus && matchesSearch;
  });

  const countPending = orders.filter(o => o.status === 'pendiente_recibido').length;
  const countReceived = orders.filter(o => o.status === 'recibido').length;
  const countSent = orders.filter(o => o.status === 'enviado').length;

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      <SellerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-racing text-slate-100 flex items-center gap-2.5">
              <ClipboardList className="w-7 h-7 text-cyan-400" />
              Gestión de Pedidos Asignados
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sport">
              Atiende solicitudes de repuestos de clientes y transfiere las órdenes a la empresa vía WhatsApp.
            </p>
          </div>

          <button
            onClick={loadData}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0d1424] border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors cursor-pointer font-sport uppercase tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Actualizar Lista
          </button>
        </div>

        {/* Tarjetas Resumen de Estados */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 font-sport">
          <button
            onClick={() => setStatusFilter('pendiente_recibido')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer
              ${statusFilter === 'pendiente_recibido'
                ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-900/20'
                : 'bg-[#0d1424]/80 border-slate-800 hover:border-slate-700'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold  text-cyan-400 uppercase tracking-wider">Pedidos Recibidos</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2 font-mono">{countPending}</p>
            <span className="text-[11px] text-slate-400 block mt-0.5">Nuevos pedidos de clientes</span>
          </button>

          <button
            onClick={() => setStatusFilter('recibido')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer
              ${statusFilter === 'recibido'
                ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-900/20'
                : 'bg-[#0d1424]/80 border-slate-800 hover:border-slate-700'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pendientes</span>
              <Send className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2 font-mono">{countReceived}</p>
            <span className="text-[11px] text-slate-400 block mt-0.5">Pendientes de WhatsApp</span>
          </button>

          <button
            onClick={() => setStatusFilter('enviado')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer
              ${statusFilter === 'enviado'
                ? 'bg-blue-950/40 border-blue-500/50 shadow-lg shadow-blue-900/20'
                : 'bg-[#0d1424]/80 border-slate-800 hover:border-slate-700'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Enviados</span>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2 font-mono">{countSent}</p>
            <span className="text-[11px] text-slate-400 block mt-0.5">En proceso de facturación</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 font-sport">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente o N° de pedido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1424] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {['todos', 'pendiente_recibido', 'recibido', 'enviado'].map((tab) => (
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
                {tab === 'todos' ? 'Todos los Pedidos' : tab === 'pendiente_recibido' ? 'Pendientes' : tab === 'recibido' ? 'Recibidos' : 'Enviados'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Pedidos */}
        {loading ? (
          <LoadingSpinner text="Cargando pedidos asignados..." />
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-[#0d1424]/40 rounded-2xl border border-slate-800 p-8">
            <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200 font-sport">No hay pedidos en esta sección</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-sport">
              {statusFilter !== 'todos'
                ? 'No existen pedidos con este estado seleccionado.'
                : 'Aún no tienes pedidos asignados. Puedes crear uno desde la pestaña "Levantar Pedido".'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <SellerOrderCard
                key={order.id}
                order={order}
                onMarkReceived={handleMarkReceived}
                onOpenWhatsApp={handleSendWhatsAppDirectly}
                onEdit={setEditingOrder}
                onDelete={handleDeleteOrder}
              />
            ))}
          </div>
        )}
      </main>

      {editingOrder && (
        <EditOrderItemsModal
          isOpen={true}
          onClose={() => setEditingOrder(null)}
          adminOrder={{
            id: editingOrder.id,
            client_name: editingOrder.client_name,
            order_number: editingOrder.order_number,
            items: editingOrder.items.map(i => ({
              ...i,
              original_quantity: i.quantity,
              adjusted_quantity: i.quantity
            }))
          }}
          onSave={async (orderId, items) => {
            await handleSaveEdit(orderId, items);
          }}
        />
      )}
    </div>
  );
}
