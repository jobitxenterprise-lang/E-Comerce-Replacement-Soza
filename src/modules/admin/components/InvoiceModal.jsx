import React from 'react';
import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Button';
import { downloadInvoicePDF } from '../../../shared/services/pdfService';
import { Download } from 'lucide-react';
import { useToast } from '../../../shared/context/ToastContext';
import logoMotoImg from '../../public/Imagenes/logomoto.png';

export default function InvoiceModal({ isOpen, onClose, invoice }) {
  const { success } = useToast();

  if (!invoice) return null;

  const handleDownload = () => {
    downloadInvoicePDF({
      invoiceNumber: invoice.invoice_number,
      orderNumber: invoice.order_number,
      clientName: invoice.client_name,
      sellerName: invoice.seller_name,
      date: invoice.invoice_date || invoice.created_at,
      items: invoice.items_snapshot || [],
      total: invoice.total_amount,
      company: invoice.company_snapshot || {},
      logoBase64: logoMotoImg
    });
    success('Factura PDF de Repuestos SOZA descargada con éxito.');
  };

  const formattedDate = invoice.invoice_date || invoice.created_at
    ? new Date(invoice.invoice_date || invoice.created_at).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : '';

  const company = invoice.company_snapshot || {};
  const items = invoice.items_snapshot || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Factura ${invoice.invoice_number}`}
      subtitle="Comprobante con formato empresarial listo para impresión o descarga"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 font-sans">
        
        {/* Hoja de Factura Empresarial */}
        <div className="bg-white text-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          
          {/* 1. Cabecera con Logo */}
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={logoMotoImg}
                alt="Logo SOZA"
                className="h-12 w-auto object-contain"
              />
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase font-sans">
                  {company.company_name || 'REPUESTOS SOZA'}
                </h2>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider">
                  {company.city || 'Matagalpa, Nicaragua'} • DISTRIBUIDOR DE REPUESTOS DE MOTOS
                </p>
              </div>
            </div>
          </div>

          {/* 2. Metadatos: Lado Izquierdo (Datos Empresa + Cliente) / Lado Derecho (N° Factura 10px + Fecha) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
            
            {/* Lado Izquierdo (7 columnas): Empresa y Cliente */}
            <div className="sm:col-span-7 space-y-3">
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[10px] tracking-wider mb-0.5">
                  DATOS DE LA EMPRESA:
                </span>
                <p className="font-bold text-slate-900 text-sm">{company.company_name || 'Repuestos SOZA'}</p>
                <p className="text-slate-600">RUC: {company.ruc_nit || 'J0310000889211'}</p>
                <p className="text-slate-600 truncate">{company.address || 'De la Gasolinera Puma 2c al Norte, Matagalpa'}</p>
                <p className="text-slate-600">Tel: {company.phone || '+505 8389-8687'} | Email: {company.email || 'ventas@repuestosoza.com'}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-500 uppercase block text-[10px] tracking-wider mb-0.5">
                  FACTURAR A:
                </span>
                <p className="font-bold text-slate-900 text-sm">{invoice.client_name}</p>
                <p className="text-slate-600 text-[11px]">
                  Asesor: {invoice.seller_name || 'Venta Mostrador'}  |  Ref. Pedido: {invoice.order_number || 'S/N'}
                </p>
              </div>
            </div>

            {/* Lado Derecho (5 columnas): N° Factura (10px) y Fecha de Emisión */}
            <div className="sm:col-span-5 text-left sm:text-right space-y-3 sm:pl-4 sm:border-l border-slate-100">
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[10px] tracking-wider mb-0.5">
                  NÚMERO DE FACTURA:
                </span>
                <p className="font-bold text-slate-900 text-[10px] sm:text-xs font-mono">
                  {invoice.invoice_number}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase block text-[10px] tracking-wider mb-0.5">
                  FECHA DE EMISIÓN:
                </span>
                <p className="text-slate-800 text-xs">
                  {formattedDate}
                </p>
              </div>
            </div>

          </div>

          {/* 3. Tabla de Artículos */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Descripción del Artículo / Repuesto</th>
                  <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{item.product_name || item.name}</td>
                    <td className="py-2 px-3 text-right font-mono">${Number(item.unit_price || 0).toFixed(2)}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">{item.adjusted_quantity || item.quantity || 1}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ${Number(item.subtotal || ((item.adjusted_quantity || item.quantity || 1) * (item.unit_price || 0))).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Totales y Términos */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-xs text-slate-500 space-y-1">
              <span className="font-bold text-slate-800 block text-xs">Términos e instrucciones:</span>
              <p>• Repuestos garantizados 100% calidad OEM de fábrica.</p>
              <p>• Condición: Contado / Despacho Inmediato.</p>
            </div>

            <div className="w-full sm:w-64 space-y-1 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>SUBTOTAL:</span>
                <span className="font-mono font-bold">${Number(invoice.total_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>DESCUENTO (0%):</span>
                <span className="font-mono">$0.00</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900 text-xs">TOTAL FACTURA:</span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  ${Number(invoice.total_amount || 0).toFixed(2)} USD
                </span>
              </div>
            </div>
          </div>

          {/* 5. Pie de Página */}
          <div className="border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400 space-y-0.5">
            <p className="font-medium text-slate-600">Gracias por hacer negocios con nosotros.</p>
            <p>{company.company_name || 'Repuestos SOZA'} • Tel: {company.phone || '+505 8389-8687'} • {company.email || 'ventas@repuestosoza.com'}</p>
          </div>

        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Cerrar
          </Button>
          <Button
            variant="soza"
            icon={Download}
            onClick={handleDownload}
            className="w-full sm:w-auto uppercase tracking-wider font-bold"
          >
            Descargar Factura PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
}
