import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoMotoImg from '../../modules/public/Imagenes/logomoto.png';

/**
 * Generador de Facturas Empresariales para REPUESTOS SOZA
 * Incluye importación y renderizado automático de logomoto.png
 */

export function generateInvoicePDF({
  invoiceNumber,
  orderNumber,
  clientName,
  sellerName,
  date,
  items = [],
  total = 0,
  company = {},
  logoBase64 = null
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const companyName = company.company_name || 'REPUESTOS SOZA';
  const companyCity = company.city || 'Matagalpa, Nicaragua';
  const companyRuc = company.ruc_nit || 'J0310000889211';
  const companyPhone = company.phone || '+505 8389-8687';
  const companyEmail = company.email || 'ventas@repuestosoza.com';
  const companyAddress = company.address || 'De la Gasolinera Puma 2c al Norte, Matagalpa, Nicaragua';

  const formattedDate = date 
    ? new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('es-ES');

  const safeTotal = Number(total || 0);

  // =========================================================================
  // 1. CABECERA CON LOGOTIPO IMPORTADO
  // =========================================================================
  const logoToUse = logoBase64 || company.logo_url || logoMotoImg;

  if (logoToUse) {
    try {
      // Dibuja el logo de la moto (x: 14mm, y: 10mm, ancho: 45mm, alto: 18mm)
      doc.addImage(logoToUse, 'PNG', 14, 10, 45, 18);
    } catch (e) {
      console.warn('Error al dibujar imagen en PDF:', e);
      // Fallback a texto en caso de error
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);
      doc.setTextColor(15, 23, 42);
      doc.text(companyName.toUpperCase(), 14, 18);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(15, 23, 42);
    doc.text(companyName.toUpperCase(), 14, 18);
  }

  // Subtítulo de la empresa (a la par o debajo del logo)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${companyCity.toUpperCase()} • DISTRIBUIDOR DE REPUESTOS DE MOTOS`, 65, 20);

  // Línea divisoria superior
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 30, 196, 30);

  // =========================================================================
  // 2. LADO IZQUIERDO: DATOS DE LA EMPRESA & FACTURAR A
  //    LADO DERECHO: NÚMERO DE FACTURA (10px) Y FECHA DE EMISIÓN
  // =========================================================================

  // --- LADO IZQUIERDO: DATOS DE LA EMPRESA ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text('DATOS DE LA EMPRESA:', 14, 37);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(companyName, 14, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`RUC: ${companyRuc}`, 14, 46.5);
  doc.text(`Dirección: ${companyAddress}`, 14, 51);
  doc.text(`Tel: ${companyPhone} | Email: ${companyEmail}`, 14, 55.5);

  // --- LADO IZQUIERDO (DEBAJO): FACTURAR A (CLIENTE) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('FACTURAR A:', 14, 63);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(clientName || 'Cliente General', 14, 68);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Vendedor: ${sellerName || 'Venta Mostrador'}  |  Ref. Pedido: ${orderNumber || 'S/N'}`, 14, 72.5);

  // --- LADO DERECHO: NÚMERO DE FACTURA (10px) Y FECHA DE EMISIÓN ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('NÚMERO DE FACTURA:', 140, 37);

  // Número de factura en tamaño 10px / 10pt
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(invoiceNumber || 'FAC-SOZA-0001', 140, 42);

  // Fecha de emisión abajo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('FECHA DE EMISIÓN:', 140, 51);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(formattedDate, 140, 56);

  // =========================================================================
  // 3. TABLA DE ARTÍCULOS / REPUESTOS
  // =========================================================================
  const tableData = items.map((item, index) => {
    const qty = Number(item.adjusted_quantity || item.quantity || 1);
    const price = Number(item.unit_price || item.price || 0);
    const subtotal = qty * price;
    return [
      (index + 1).toString(),
      item.product_name || item.name || 'Repuesto de Motocicleta',
      `C$${price.toFixed(2)}`,
      qty.toString(),
      `C$${subtotal.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: 79,
    head: [['#', 'DESCRIPCIÓN DEL ARTÍCULO / REPUESTO', 'PRECIO UNIT.', 'CANT.', 'TOTAL']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      minCellHeight: 9
    },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: [51, 65, 85],
      lineColor: [241, 245, 249],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 105 },
      2: { halign: 'right', cellWidth: 26 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'right', cellWidth: 23 }
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255]
    }
  });

  // =========================================================================
  // 4. TOTALES Y TÉRMINOS
  // =========================================================================
  const finalY = doc.lastAutoTable.finalY + 8;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, finalY - 4, 196, finalY - 4);

  // Términos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Términos y condiciones:', 14, finalY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('• Repuestos garantizados 100% calidad OEM de fábrica.', 14, finalY + 9);
  doc.text('• Distribuidor oficial TRX Tires, X-SPORS, EVERESTT y KIGCOL.', 14, finalY + 14);
  doc.text('• Conserve esta factura para cualquier reclamo o trámite de garantía.', 14, finalY + 19);

  // Totales
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('SUBTOTAL:', 140, finalY + 4);
  doc.text(`C$${safeTotal.toFixed(2)}`, 196, finalY + 4, { align: 'right' });

  doc.text('DESCUENTO (0%):', 140, finalY + 9);
  doc.text('$0.00', 196, finalY + 9, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL FACTURA:', 140, finalY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(`C$${safeTotal.toFixed(2)}`, 196, finalY + 23, { align: 'right' });

  // =========================================================================
  // 5. PIE DE PÁGINA
  // =========================================================================
  doc.setDrawColor(241, 245, 249);
  doc.line(14, 270, 196, 270);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Gracias por hacer negocios con nosotros.', 105, 275, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`${companyName} • ${companyAddress}`, 105, 279, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Tel: ${companyPhone} | Email: ${companyEmail} | Matagalpa, Nicaragua`, 105, 283, { align: 'center' });

  return doc;
}

export function downloadInvoicePDF(data) {
  const doc = generateInvoicePDF(data);
  const filename = `factura_${data.invoiceNumber || 'soza'}.pdf`;
  doc.save(filename);
}

export function getInvoicePDFDataUri(data) {
  const doc = generateInvoicePDF(data);
  return doc.output('datauristring');
}

export function getInvoicePDFBlobUrl(data) {
  const doc = generateInvoicePDF(data);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
