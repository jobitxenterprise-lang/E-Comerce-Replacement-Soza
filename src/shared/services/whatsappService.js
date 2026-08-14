/**
 * Servicio de Generación de Mensajes y Enlaces para WhatsApp
 * Formatea el pedido para ser enviado directamente a la empresa por el vendedor.
 * IMPORTANTE: No incluye enlaces de imágenes según los requerimientos especificados.
 */

export function formatWhatsAppMessage({
  orderNumber,
  clientName,
  sellerName,
  date,
  items = [],
  total = 0,
  notes = ''
}) {
  const formattedDate = date 
    ? new Date(date).toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString('es-ES');

  let msg = `🛍️ *NUEVO PEDIDO: ${orderNumber || 'S/N'}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 *Cliente:* ${clientName || 'Cliente General'}\n`;
  msg += `💼 *Vendedor:* ${sellerName || 'Vendedor Asignado'}\n`;
  msg += `📅 *Fecha:* ${formattedDate}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📦 *DETALLE DE PRODUCTOS:*\n\n`;

  items.forEach((item, index) => {
    const qty = Number(item.quantity || item.adjusted_quantity || 1);
    const name = item.product_name || item.name || 'Producto';
    const price = Number(item.unit_price || item.price || 0);
    const subtotal = qty * price;
    msg += `${index + 1}. *${qty}x* ${name}\n   └ Unit: C$${price.toFixed(2)} | Subtotal: C$${subtotal.toFixed(2)}\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *TOTAL A PAGAR: C$${Number(total || 0).toFixed(2)}*\n`;
  
  if (notes && notes.trim()) {
    msg += `📝 *Observaciones:* ${notes.trim()}\n`;
  }
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `✨ _Enviado desde la plataforma SOZA Perfumes_`;

  return msg;
}

export function generateWhatsAppUrl(phoneNumber, message) {
  // Limpiar caracteres no numéricos del teléfono
  const cleanPhone = (phoneNumber || '').toString().replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
