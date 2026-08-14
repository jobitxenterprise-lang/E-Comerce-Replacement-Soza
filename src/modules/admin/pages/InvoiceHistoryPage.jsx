import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import Button from '../../../shared/components/Button';
import InvoiceModal from '../components/InvoiceModal';
import { getInvoices, getSellers } from '../../../shared/services/dataService';
import { downloadInvoicePDF } from '../../../shared/services/pdfService';
import { useToast } from '../../../shared/context/ToastContext';
import { FileText, Download, Eye, Search, RefreshCw, Calendar, Disc3 } from 'lucide-react';

export default function InvoiceHistoryPage() {
  const { success, error } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invData, sellersData] = await Promise.all([
        getInvoices(),
        getSellers()
      ]);
      setInvoices(invData || []);
      setSellers(sellersData || []);
    } catch (e) {
      error('Error al cargar facturas: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDirect = (inv) => {
    downloadInvoicePDF({
      invoiceNumber: inv.invoice_number,
      orderNumber: inv.order_number,
      clientName: inv.client_name,
      sellerName: inv.seller_name,
      date: inv.invoice_date || inv.created_at,
      items: inv.items_snapshot || [],
      total: inv.total_amount,
      company: inv.company_snapshot || {}
    });
    success(`Factura ${inv.invoice_number} descargada.`);
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inv.seller_name && inv.seller_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sport">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-racing text-slate-100 flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-cyan-400" />
            Historial de Facturas Emitidas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consulta y descarga todas las facturas en PDF generadas al despachar pedidos en Matagalpa.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0d1424] border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors cursor-pointer uppercase tracking-wider"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          Actualizar Facturas
        </button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por N° de factura, cliente o vendedor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0d1424] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Tabla Responsiva */}
      {loading ? (
        <LoadingSpinner text="Cargando facturas emitidas..." />
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-16 bg-[#0d1424]/40 rounded-2xl border border-slate-800 p-8">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No hay facturas emitidas aún</h3>
          <p className="text-xs text-slate-400 mt-1">
            Al procesar y marcar como "Facturado" un pedido recibido de los vendedores, se generará el documento aquí.
          </p>
        </div>
      ) : (
        <div className="bg-[#0d1424]/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080d18] text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">N° Factura</th>
                  <th className="p-4">Fecha Emisión</th>
                  <th className="p-4">Cliente / Taller</th>
                  <th className="p-4">Vendedor</th>
                  <th className="p-4">Cant. Items</th>
                  <th className="p-4 text-right">Total Facturado</th>
                  <th className="p-4 text-right">Acciones</th>
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
                        {new Date(inv.invoice_date || inv.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 font-bold text-slate-100">
                        {inv.client_name}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                          <span className="text-cyan-300 font-bold whitespace-nowrap">
                            {inv.seller_name || 'Venta de Mostrador'}
                          </span>
                          {seller?.zone && (
                            <span className="text-[10px] text-slate-400 font-normal bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 whitespace-nowrap">
                              {seller.zone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        {inv.items_snapshot ? inv.items_snapshot.length : 0} repuesto(s)
                      </td>
                    <td className="p-4 text-right font-black text-cyan-400 font-mono text-sm">
                      ${Number(inv.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedInvoice(inv)}
                          title="Ver Factura"
                        >
                          Ver
                        </Button>
                        <Button
                          variant="soza"
                          size="sm"
                          icon={Download}
                          onClick={() => handleDownloadDirect(inv)}
                          className="font-sport uppercase tracking-wider"
                        >
                          PDF
                        </Button>
                      </div>
                    </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Visor */}
      <InvoiceModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
