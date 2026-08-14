import React, { useState, useEffect, useMemo } from 'react';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import Button from '../../../shared/components/Button';
import { getInvoices, getProducts, getSellers } from '../../../shared/services/dataService';
import { exportOrdersToExcel } from '../../../shared/services/excelService';
import { useToast } from '../../../shared/context/ToastContext';
import { BarChart3, Download, DollarSign, Package, TrendingUp, Calendar, Disc3, ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const { success, error } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invs, prods, sellersData] = await Promise.all([
        getInvoices(),
        getProducts(),
        getSellers()
      ]);
      setInvoices(invs || []);
      setProducts(prods || []);
      setSellers(sellersData || []);
    } catch (e) {
      error('Error al cargar datos de reportes: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (selectedMonth === 'todos') return true;
      const invDate = new Date(inv.invoice_date || inv.created_at);
      const monthKey = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedMonth;
    });
  }, [invoices, selectedMonth]);

  const totalBilled = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  }, [filteredInvoices]);

  const totalItemsSold = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => {
      const count = inv.items_snapshot
        ? inv.items_snapshot.reduce((acc, it) => acc + Number(it.adjusted_quantity || it.quantity || 1), 0)
        : 0;
      return sum + count;
    }, 0);
  }, [filteredInvoices]);

  const handleExport = () => {
    try {
      exportOrdersToExcel(
        filteredInvoices,
        `reporte_ventas_soza_${selectedMonth}_${new Date().toISOString().split('T')[0]}.xlsx`
      );
      success('Reporte contable exportado a Excel exitosamente.');
    } catch (e) {
      error('Error al exportar: ' + e.message);
    }
  };

  return (
    <div className="space-y-8 font-sport">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-racing text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            Reportes y Rendimiento Contable
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Análisis de facturación mensual de Repuestos SOZA, unidades despachadas y exportación a Excel.
          </p>
        </div>

        {/* Selector de Mes y Botón Exportar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-[#0d1424] px-3 py-1.5 rounded-xl border border-slate-800">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs text-slate-100 focus:outline-none cursor-pointer"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            icon={Download}
            disabled={filteredInvoices.length === 0}
          >
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Responsivas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#0d1424]/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Facturado</span>
            <DollarSign className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">
            C${totalBilled.toFixed(2)}
          </p>
          <span className="text-xs text-slate-400 block mt-1">
            Ingresos netos por ventas liquidadas
          </span>
        </div>

        <div className="bg-[#0d1424]/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Facturas Emitidas</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-100 font-mono">
            {filteredInvoices.length}
          </p>
          <span className="text-xs text-slate-400 block mt-1">
            Órdenes despachadas y facturadas
          </span>
        </div>

        <div className="bg-[#0d1424]/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Repuestos Despachados</span>
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
            {totalItemsSold}
          </p>
          <span className="text-xs text-slate-400 block mt-1">
            Unidades vendidas en el período
          </span>
        </div>
      </div>

      {/* Detalle de Facturas del Mes */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-racing text-slate-100">
          Facturas del Período ({filteredInvoices.length})
        </h2>

        {loading ? (
          <LoadingSpinner text="Calculando métricas..." />
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-16 bg-[#0d1424]/40 rounded-2xl border border-slate-800 p-8">
            <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200">No hay ventas registradas en este período</h3>
            <p className="text-xs text-slate-400 mt-1">
              Selecciona otro mes o factura nuevos pedidos para visualizar los reportes.
            </p>
          </div>
        ) : (
          <div className="bg-[#0d1424]/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#080d18] text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">N° Factura</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Vendedor</th>
                    <th className="p-4 text-right">Total Facturado (C$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInvoices.map((inv) => {
                    const seller = sellers.find(s => 
                      s.name?.toLowerCase().trim() === inv.seller_name?.toLowerCase().trim() ||
                      s.id === inv.seller_id
                    );
                    return (
                      <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-cyan-400">
                          {inv.invoice_number}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {new Date(inv.invoice_date || inv.created_at).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 font-bold text-slate-100">
                          {inv.client_name}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                            <span className="text-cyan-300 font-bold whitespace-nowrap">
                              {inv.seller_name || 'Venta Directa'}
                            </span>
                            {seller?.zone && (
                              <span className="text-[10px] text-slate-400 font-normal bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 whitespace-nowrap">
                                {seller.zone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right font-black text-cyan-400 font-mono text-sm">
                          C${Number(inv.total_amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
