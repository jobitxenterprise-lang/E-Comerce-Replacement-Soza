import * as XLSX from 'xlsx';

/**
 * Servicio de exportación a Excel para reportes contables y administrativos
 */

export function exportOrdersToExcel(orders = [], filename = 'reporte_pedidos.xlsx') {
  if (!orders || orders.length === 0) {
    throw new Error('No hay pedidos disponibles para exportar.');
  }

  const data = orders.map(order => ({
    'N° Pedido': order.order_number || '',
    'Fecha': order.order_date || order.created_at ? new Date(order.order_date || order.created_at).toLocaleDateString('es-ES') : '',
    'Cliente': order.client_name || '',
    'Vendedor': order.seller_name || order.seller?.name || 'N/A',
    'Origen': order.origin === 'vendedor' ? 'Vendedor Directo' : 'Público / Catálogo',
    'Estado': (order.status || '').toUpperCase(),
    'Total ($)': Number(order.total || order.adjusted_total || 0).toFixed(2),
    'Notas': order.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 16 }, // N° Pedido
    { wch: 14 }, // Fecha
    { wch: 24 }, // Cliente
    { wch: 22 }, // Vendedor
    { wch: 18 }, // Origen
    { wch: 18 }, // Estado
    { wch: 14 }, // Total
    { wch: 30 }  // Notas
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');
  XLSX.writeFile(workbook, filename);
}

export function exportInvoicesToExcel(invoices = [], filename = 'reporte_facturacion.xlsx') {
  if (!invoices || invoices.length === 0) {
    throw new Error('No hay facturas disponibles para exportar.');
  }

  const data = invoices.map(inv => ({
    'N° Factura': inv.invoice_number || '',
    'Fecha Emisión': inv.invoice_date || inv.created_at ? new Date(inv.invoice_date || inv.created_at).toLocaleDateString('es-ES') : '',
    'Cliente': inv.client_name || '',
    'Vendedor': inv.seller_name || 'Venta Directa',
    'Monto Total ($)': Number(inv.total_amount || 0).toFixed(2)
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 16 },
    { wch: 26 },
    { wch: 24 },
    { wch: 16 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Facturas');
  XLSX.writeFile(workbook, filename);
}
