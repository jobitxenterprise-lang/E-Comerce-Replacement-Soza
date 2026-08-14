import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import Badge from '../../../shared/components/Badge';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import { getOrders, getAdminOrders, getSellers } from '../../../shared/services/dataService';
import { exportOrdersToExcel } from '../../../shared/services/excelService';
import { useToast } from '../../../shared/context/ToastContext';
import { Search, Download, RefreshCw, ShoppingCart, ShieldCheck, Wrench } from 'lucide-react';

export default function QueryOrdersPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('vendedor'); // 'vendedor' | 'admin'
  const [sellerOrders, setSellerOrders] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State para modal "Ver más detalles"
  const [detailsModalItems, setDetailsModalItems] = useState(null);
  const [detailsModalTitle, setDetailsModalTitle] = useState('');

  useEffect(() => {
    loadAllOrders();
  }, []);

  const loadAllOrders = async () => {
    setLoading(true);
    try {
      const [sOrders, aOrders, sellersData] = await Promise.all([
        getOrders(),
        getAdminOrders(),
        getSellers()
      ]);
      setSellerOrders(sOrders || []);
      setAdminOrders(aOrders || []);
      setSellers(sellersData || []);
    } catch (e) {
      error('Error al cargar pedidos: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const listToExport = activeTab === 'vendedor' ? sellerOrders : adminOrders;
      exportOrdersToExcel(listToExport, `pedidos_soza_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
      success('Reporte de pedidos exportado a Excel.');
    } catch (e) {
      error(e.message);
    }
  };

  const displayedOrders = (activeTab === 'vendedor' ? sellerOrders : adminOrders).filter(order => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.order_number?.toLowerCase().includes(q) ||
      order.client_name?.toLowerCase().includes(q) ||
      order.seller_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sport">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-racing text-slate-100 flex items-center gap-2.5">
            <Search className="w-7 h-7 text-cyan-400" />
            Consulta General de Pedidos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explora y audita todos los pedidos de repuestos registrados en ambas tablas del sistema.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllOrders}
            icon={RefreshCw}
          >
            Actualizar
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            icon={Download}
          >
            Exportar a Excel
          </Button>
        </div>
      </div>

      {/* Selector de Tabla (Público/Vendedor vs Admin) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#0d1424] p-1.5 rounded-2xl border border-slate-800 max-w-xl">
        <button
          onClick={() => setActiveTab('vendedor')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider
            ${activeTab === 'vendedor'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
            }
          `}
        >
          <ShoppingCart className="w-4 h-4" />
          Tabla "Pedido" (Vendedor) ({sellerOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider
            ${activeTab === 'admin'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
            }
          `}
        >
          <ShieldCheck className="w-4 h-4" />
          Tabla "PedidoAdmin" (Admin) ({adminOrders.length})
        </button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por N° de pedido, cliente o vendedor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0d1424] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-sport"
        />
      </div>

      {/* Tabla */}
      {loading ? (
        <LoadingSpinner text="Consultando pedidos del sistema..." />
      ) : displayedOrders.length === 0 ? (
        <div className="text-center py-16 bg-[#0d1424]/40 rounded-2xl border border-slate-800 p-8">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No se encontraron registros</h3>
          <p className="text-xs text-slate-400 mt-1">
            No existen pedidos que coincidan con los criterios de búsqueda.
          </p>
        </div>
      ) : (
        <div className="bg-[#0d1424]/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080d18] text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">N° Pedido</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Vendedor</th>
                  <th className="p-4">Repuestos / Cantidades</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Total (C$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedOrders.map((order) => {
                  const dateStr = order.order_date || order.reception_date || order.created_at;
                  const seller = sellers.find(s => 
                    s.name?.toLowerCase().trim() === order.seller_name?.toLowerCase().trim() ||
                    s.id === order.seller_id
                  );
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-cyan-400">
                        {order.order_number}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {new Date(dateStr).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 font-bold text-slate-100">
                        {order.client_name}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                          <span className="text-cyan-400 font-bold whitespace-nowrap">
                            {order.seller_name || 'N/A'}
                          </span>
                          {seller?.zone && (
                            <span className="text-[10px] text-slate-400 font-normal bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 whitespace-nowrap">
                              {seller.zone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="space-y-0.5">
                          {order.items && order.items.slice(0, 5).map((it, idx) => (
                            <div key={idx} className="truncate text-[11px] text-slate-300">
                              <span className="font-bold text-cyan-400 font-mono">
                                {it.adjusted_quantity || it.quantity || 1}x
                              </span> {it.product_name || it.name}
                            </div>
                          ))}
                          {order.items && order.items.length > 5 && (
                            <button
                              onClick={() => {
                                setDetailsModalTitle(`Pedido ${order.order_number}`);
                                setDetailsModalItems(order.items);
                              }}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold mt-1 uppercase tracking-wider underline decoration-cyan-400/50 underline-offset-2 transition-all cursor-pointer"
                            >
                              Ver {order.items.length - 5} más...
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            order.status === 'facturado' || order.status === 'enviado' ? 'success' :
                            (order.status === 'cancelado' || order.status === 'rechazado') ? 'cancelled' :
                            order.status === 'recibido' ? 'received' : 'pending'
                          }
                          size="sm"
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-mono font-black text-cyan-400 text-sm">
                        C${Number(order.total || order.adjusted_total || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalles de Repuestos */}
      <Modal
        isOpen={Boolean(detailsModalItems)}
        onClose={() => setDetailsModalItems(null)}
        title={detailsModalTitle}
        subtitle="Lista completa de repuestos y cantidades solicitadas para este pedido."
        maxWidth="max-w-md"
      >
        <div className="space-y-3 font-sport max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {detailsModalItems && detailsModalItems.map((it, idx) => (
            <div key={idx} className="bg-[#080d18] border border-slate-800 rounded-xl p-3 flex justify-between items-center gap-3">
              <span className="font-bold text-slate-100 text-sm line-clamp-2 flex-1">
                {it.product_name || it.name}
              </span>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Cant.</span>
                <span className="text-sm font-black text-cyan-400 font-mono">
                  {it.adjusted_quantity || it.quantity || 1}x
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-slate-800 flex justify-end mt-4">
          <Button variant="secondary" onClick={() => setDetailsModalItems(null)}>
            Cerrar
          </Button>
        </div>
      </Modal>

    </div>
  );
}
