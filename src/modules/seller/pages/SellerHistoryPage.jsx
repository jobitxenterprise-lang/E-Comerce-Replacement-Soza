import React, { useState, useEffect, useMemo } from 'react';
import SellerNavbar from '../components/SellerNavbar';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import Badge from '../../../shared/components/Badge';
import { useAuth } from '../../../shared/context/AuthContext';
import { getOrdersBySeller } from '../../../shared/services/dataService';
import { History, Calendar, DollarSign, Package, TrendingUp, Search, Wrench } from 'lucide-react';

export default function SellerHistoryPage() {
  const { currentSeller } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentSeller?.id) {
      loadHistory();
    }
  }, [currentSeller]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const list = await getOrdersBySeller(currentSeller.id);
      setOrders(list || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.order_date || order.created_at);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      
      const matchesMonth = selectedMonth === 'todos' ? true : monthKey === selectedMonth;
      const matchesSearch = searchQuery.trim()
        ? (order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
           order.client_name.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      return matchesMonth && matchesSearch;
    });
  }, [orders, selectedMonth, searchQuery]);

  const totalSold = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  }, [filteredOrders]);

  const totalProductsSold = useMemo(() => {
    return filteredOrders.reduce((sum, o) => {
      const itemsCount = o.items ? o.items.reduce((acc, it) => acc + Number(it.quantity || 1), 0) : 0;
      return sum + itemsCount;
    }, 0);
  }, [filteredOrders]);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      <SellerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-racing text-slate-100 flex items-center gap-2.5">
              <History className="w-7 h-7 text-cyan-400" />
              Historial de Ventas SOZA
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sport">
              Registro histórico de tus pedidos de repuestos despachados con filtro mensual.
            </p>
          </div>

          {/* Selector de Mes */}
          <div className="flex items-center gap-2 font-sport">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#0d1424] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
            />
            {selectedMonth !== 'todos' && (
              <button
                onClick={() => setSelectedMonth('todos')}
                className="px-2.5 py-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Ver Todos
              </button>
            )}
          </div>
        </div>

        {/* Tarjetas de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 font-sport">
          <div className="bg-[#0d1424]/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Monto Total Vendido</span>
              <DollarSign className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-black text-cyan-400 font-mono">
              ${totalSold.toFixed(2)}
            </p>
            <span className="text-[11px] text-slate-400 block mt-1">
              En el período seleccionado
            </span>
          </div>

          <div className="bg-[#0d1424]/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pedidos Atendidos</span>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-slate-100 font-mono">
              {filteredOrders.length}
            </p>
            <span className="text-[11px] text-slate-400 block mt-1">
              Órdenes de clientes asignadas
            </span>
          </div>

          <div className="bg-[#0d1424]/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Repuestos Despachados</span>
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400 font-mono">
              {totalProductsSold}
            </p>
            <span className="text-[11px] text-slate-400 block mt-1">
              Unidades de repuestos y accesorios
            </span>
          </div>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en el historial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1424] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-sport"
            />
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <LoadingSpinner text="Cargando historial de ventas..." />
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-[#0d1424]/40 rounded-2xl border border-slate-800 p-8 font-sport">
            <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200">No hay ventas registradas</h3>
            <p className="text-xs text-slate-400 mt-1">
              No se encontraron registros de ventas en este mes seleccionado.
            </p>
          </div>
        ) : (
          <div className="bg-[#0d1424]/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl font-sport">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#080d18] text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">N° Pedido</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Origen</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Total ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-cyan-400">
                        {order.order_number}
                      </td>
                      <td className="p-4">
                        {new Date(order.order_date || order.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 font-bold text-slate-100">
                        {order.client_name}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-bold text-slate-300">
                          {order.origin === 'vendedor' ? 'Mostrador' : 'Público'}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            order.status === 'enviado' ? 'sent' :
                            order.status === 'recibido' ? 'received' : 'pending'
                          }
                          size="sm"
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-bold text-cyan-400 text-sm font-mono">
                        ${Number(order.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
