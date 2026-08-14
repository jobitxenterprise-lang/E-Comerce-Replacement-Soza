import { supabase, isSupabaseConfigured } from './supabaseClient';
import { initialProducts, initialSellers, initialAdmins, initialCompanySettings } from '../../data/seedData';

const LOCAL_STORAGE_KEYS = {
  PRODUCTS: 'soza_moto_products_v2',
  SELLERS: 'soza_moto_sellers_v2',
  ADMINS: 'soza_moto_admins_v2',
  ORDERS: 'soza_moto_orders_v2',
  ORDER_ITEMS: 'soza_moto_order_items_v2',
  ADMIN_ORDERS: 'soza_moto_admin_orders_v2',
  ADMIN_ORDER_ITEMS: 'soza_moto_admin_order_items_v2',
  INVOICES: 'soza_moto_invoices_v2',
  SETTINGS: 'soza_moto_settings_v2'
};

// Inicializar almacenamiento local si está vacío
function initLocalStorage() {
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.SELLERS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SELLERS, JSON.stringify(initialSellers));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.ADMINS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ADMINS, JSON.stringify(initialAdmins));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(initialCompanySettings));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.ORDER_ITEMS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDER_ITEMS, JSON.stringify([]));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_ORDERS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_ORDER_ITEMS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_ORDER_ITEMS, JSON.stringify([]));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICES)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.INVOICES, JSON.stringify([]));
  }
}

initLocalStorage();

// Helpers locales
function getLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function setLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ==========================================
// 1. PRODUCTOS
// ==========================================
export async function getProducts() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocal(LOCAL_STORAGE_KEYS.PRODUCTS, data);
        return data;
      }
    } catch (e) {
      console.warn('Fallback a productos locales:', e);
    }
  }
  return getLocal(LOCAL_STORAGE_KEYS.PRODUCTS);
}

export async function addProduct(productData) {
  const newProduct = {
    id: 'prod-' + crypto.randomUUID(),
    ...productData,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('products').insert([productData]).select().single();
      if (!error && data) {
        const local = getLocal(LOCAL_STORAGE_KEYS.PRODUCTS);
        setLocal(LOCAL_STORAGE_KEYS.PRODUCTS, [data, ...local]);
        return data;
      }
    } catch (e) {
      console.warn('Error en Supabase addProduct, guardando local:', e);
    }
  }

  const local = getLocal(LOCAL_STORAGE_KEYS.PRODUCTS);
  const updated = [newProduct, ...local];
  setLocal(LOCAL_STORAGE_KEYS.PRODUCTS, updated);
  return newProduct;
}

export async function updateProduct(id, updates) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('products').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Error Supabase updateProduct:', e);
    }
  }
  const local = getLocal(LOCAL_STORAGE_KEYS.PRODUCTS);
  const updated = local.map(p => p.id === id ? { ...p, ...updates } : p);
  setLocal(LOCAL_STORAGE_KEYS.PRODUCTS, updated);
  return updated.find(p => p.id === id);
}

export async function updateProductStock(id, newStock) {
  return updateProduct(id, { stock: Math.max(0, parseInt(newStock, 10) || 0) });
}

export async function decreaseProductStock(productId, qty) {
  const products = getLocal(LOCAL_STORAGE_KEYS.PRODUCTS);
  const prod = products.find(p => p.id === productId);
  if (prod) {
    const updatedStock = Math.max(0, Number(prod.stock || 0) - Number(qty || 0));
    await updateProduct(productId, { stock: updatedStock });
  }
}

// ==========================================
// 2. VENDEDORES
// ==========================================
export async function getSellers() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('sellers').select('*').eq('active', true);
      if (!error && data && data.length > 0) {
        setLocal(LOCAL_STORAGE_KEYS.SELLERS, data);
        return data;
      }
    } catch (e) {
      console.warn('Fallback a vendedores locales:', e);
    }
  }
  return getLocal(LOCAL_STORAGE_KEYS.SELLERS).filter(s => s.active !== false);
}

export async function getSellerById(id) {
  const sellers = await getSellers();
  return sellers.find(s => s.id === id) || null;
}

export async function authenticateSeller(username, password) {
  const sellers = getLocal(LOCAL_STORAGE_KEYS.SELLERS);
  const seller = sellers.find(
    s => (s.username.toLowerCase() === username.trim().toLowerCase()) && 
         (s.password === password.trim()) && 
         s.active !== false
  );
  if (seller) {
    return { success: true, seller };
  }
  return { success: false, message: 'Usuario o contraseña de vendedor incorrectos.' };
}

// ==========================================
// 3. ADMINISTRADOR
// ==========================================
export async function authenticateAdmin(usernameOrEmail, password) {
  const admins = getLocal(LOCAL_STORAGE_KEYS.ADMINS);
  const query = usernameOrEmail.trim().toLowerCase();
  const admin = admins.find(
    a => (a.username.toLowerCase() === query || a.email.toLowerCase() === query) &&
         (a.password === password.trim())
  );
  if (admin) {
    return { success: true, admin };
  }
  return { success: false, message: 'Credenciales de administrador incorrectas.' };
}

// ==========================================
// 4. PEDIDOS (Tabla "Pedido" - Vendedor / Público)
// ==========================================
export async function createOrder({ client_name, seller_id, origin = 'publico', items = [], notes = '' }) {
  const orderNumber = 'SZ-MOTO-' + Math.floor(100000 + Math.random() * 900000);
  const orderId = 'ord-' + crypto.randomUUID();
  const calculatedTotal = items.reduce((acc, item) => acc + (Number(item.price || item.unit_price || 0) * Number(item.quantity || 1)), 0);

  const newOrder = {
    id: orderId,
    order_number: orderNumber,
    client_name: client_name.trim(),
    seller_id: seller_id || null,
    order_date: new Date().toISOString(),
    status: 'pendiente_recibido',
    origin: origin, // 'publico' | 'vendedor'
    total: calculatedTotal,
    notes: notes || '',
    created_at: new Date().toISOString()
  };

  const newItems = items.map(item => ({
    id: 'item-' + crypto.randomUUID(),
    order_id: orderId,
    product_id: item.id || item.product_id,
    product_name: item.name || item.product_name,
    quantity: Number(item.quantity || 1),
    unit_price: Number(item.price || item.unit_price || 0),
    subtotal: Number(item.quantity || 1) * Number(item.price || item.unit_price || 0),
    created_at: new Date().toISOString()
  }));

  const orders = getLocal(LOCAL_STORAGE_KEYS.ORDERS);
  const orderItems = getLocal(LOCAL_STORAGE_KEYS.ORDER_ITEMS);

  setLocal(LOCAL_STORAGE_KEYS.ORDERS, [newOrder, ...orders]);
  setLocal(LOCAL_STORAGE_KEYS.ORDER_ITEMS, [...newItems, ...orderItems]);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('orders').insert([newOrder]);
      await supabase.from('order_items').insert(newItems);
    } catch (e) {
      console.warn('Error en Supabase createOrder:', e);
    }
  }

  return { ...newOrder, items: newItems };
}

export async function getOrders() {
  const orders = getLocal(LOCAL_STORAGE_KEYS.ORDERS);
  const orderItems = getLocal(LOCAL_STORAGE_KEYS.ORDER_ITEMS);
  const sellers = getLocal(LOCAL_STORAGE_KEYS.SELLERS);

  return orders.map(order => {
    const items = orderItems.filter(item => item.order_id === order.id);
    const seller = sellers.find(s => s.id === order.seller_id) || null;
    return {
      ...order,
      items,
      seller,
      seller_name: seller ? seller.name : 'No Asignado'
    };
  });
}

export async function getOrdersBySeller(sellerId) {
  const allOrders = await getOrders();
  return allOrders.filter(order => order.seller_id === sellerId);
}

export async function updateOrderStatus(orderId, newStatus) {
  const orders = getLocal(LOCAL_STORAGE_KEYS.ORDERS);
  const targetOrder = orders.find(o => o.id === orderId);
  if (!targetOrder) throw new Error('Pedido no encontrado');

  const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
  setLocal(LOCAL_STORAGE_KEYS.ORDERS, updatedOrders);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    } catch (e) {
      console.warn('Error Supabase updateOrderStatus:', e);
    }
  }

  // SI PASA A 'enviado', SE CREA AUTOMÁTICAMENTE EN TABLA 'PedidoAdmin'
  if (newStatus === 'enviado') {
    const existingAdminOrders = getLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDERS);
    const alreadyExists = existingAdminOrders.some(ao => ao.order_id === orderId);

    if (!alreadyExists) {
      const orderItems = getLocal(LOCAL_STORAGE_KEYS.ORDER_ITEMS).filter(it => it.order_id === orderId);
      const adminOrderId = 'admin-ord-' + crypto.randomUUID();

      const newAdminOrder = {
        id: adminOrderId,
        order_id: targetOrder.id,
        order_number: targetOrder.order_number,
        seller_id: targetOrder.seller_id,
        client_name: targetOrder.client_name,
        reception_date: new Date().toISOString(),
        status: 'pendiente',
        adjusted_total: targetOrder.total,
        edited_by_admin: false,
        admin_notes: '',
        created_at: new Date().toISOString()
      };

      const newAdminItems = orderItems.map(item => ({
        id: 'admin-item-' + crypto.randomUUID(),
        admin_order_id: adminOrderId,
        product_id: item.product_id,
        product_name: item.product_name,
        original_quantity: item.quantity,
        adjusted_quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        created_at: new Date().toISOString()
      }));

      const adminOrders = getLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDERS);
      const adminOrderItems = getLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDER_ITEMS);

      setLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDERS, [newAdminOrder, ...adminOrders]);
      setLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDER_ITEMS, [...newAdminItems, ...adminOrderItems]);

      if (isSupabaseConfigured) {
        try {
          await supabase.from('admin_orders').insert([newAdminOrder]);
          await supabase.from('admin_order_items').insert(newAdminItems);
        } catch (e) {
          console.warn('Error en Supabase createAdminOrder:', e);
        }
      }
    }
  }

  return { success: true, newStatus };
}

// ==========================================
// 5. PEDIDOS ADMIN (Tabla "PedidoAdmin")
// ==========================================
export async function getAdminOrders() {
  const adminOrders = getLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDERS);
  const adminOrderItems = getLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDER_ITEMS);
  const sellers = getLocal(LOCAL_STORAGE_KEYS.SELLERS);
  const orders = getLocal(LOCAL_STORAGE_KEYS.ORDERS);

  return adminOrders.map(ao => {
    const items = adminOrderItems.filter(item => item.admin_order_id === ao.id);
    const seller = sellers.find(s => s.id === ao.seller_id) || null;
    const originalOrder = orders.find(o => o.id === ao.order_id) || null;
    return {
      ...ao,
      items,
      seller,
      seller_name: seller ? seller.name : 'Venta Directa',
      original_order: originalOrder
    };
  });
}

export async function updateAdminOrderItems(adminOrderId, updatedItems) {
  let newTotal = 0;
  const adminOrderItems = getLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDER_ITEMS);

  const updatedAdminItems = adminOrderItems.map(item => {
    if (item.admin_order_id === adminOrderId) {
      const match = updatedItems.find(ui => ui.id === item.id || ui.product_id === item.product_id);
      if (match) {
        const adjustedQty = Math.max(0, parseInt(match.adjusted_quantity, 10) || 0);
        const subtotal = adjustedQty * Number(item.unit_price || 0);
        newTotal += subtotal;
        return {
          ...item,
          adjusted_quantity: adjustedQty,
          subtotal: subtotal
        };
      } else {
        newTotal += Number(item.subtotal || 0);
      }
    }
    return item;
  });

  setLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDER_ITEMS, updatedAdminItems);

  const adminOrders = getLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDERS);
  const updatedOrders = adminOrders.map(ao => {
    if (ao.id === adminOrderId) {
      return {
        ...ao,
        adjusted_total: newTotal,
        edited_by_admin: true
      };
    }
    return ao;
  });

  setLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDERS, updatedOrders);
  return { success: true, newTotal };
}

export async function updateAdminOrderStatus(adminOrderId, newStatus) {
  const adminOrders = getLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDERS);
  const target = adminOrders.find(ao => ao.id === adminOrderId);
  if (!target) throw new Error('Pedido de administración no encontrado');

  const updated = adminOrders.map(ao => ao.id === adminOrderId ? { ...ao, status: newStatus } : ao);
  setLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDERS, updated);

  let generatedInvoice = null;

  if (newStatus === 'facturado') {
    const adminOrderItems = getLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDER_ITEMS).filter(it => it.admin_order_id === adminOrderId);
    const sellers = getLocal(LOCAL_STORAGE_KEYS.SELLERS);
    const seller = sellers.find(s => s.id === target.seller_id);
    const company = getLocal(LOCAL_STORAGE_KEYS.SETTINGS);

    // 1. Descontar Stock de los repuestos
    for (const item of adminOrderItems) {
      if (item.product_id && item.adjusted_quantity > 0) {
        await decreaseProductStock(item.product_id, item.adjusted_quantity);
      }
    }

    // 2. Generar Factura
    const invoices = getLocal(LOCAL_STORAGE_KEYS.INVOICES);
    const invoiceNumber = `FAC-SOZA-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
    
    generatedInvoice = {
      id: 'inv-' + crypto.randomUUID(),
      invoice_number: invoiceNumber,
      admin_order_id: adminOrderId,
      order_number: target.order_number,
      client_name: target.client_name,
      seller_name: seller ? seller.name : 'Venta Directa',
      invoice_date: new Date().toISOString(),
      total_amount: target.adjusted_total,
      items_snapshot: adminOrderItems,
      company_snapshot: company,
      created_at: new Date().toISOString()
    };

    setLocal(LOCAL_STORAGE_KEYS.INVOICES, [generatedInvoice, ...invoices]);
  }

  return { success: true, newStatus, invoice: generatedInvoice };
}

// ==========================================
// 6. FACTURAS
// ==========================================
export async function getInvoices() {
  return getLocal(LOCAL_STORAGE_KEYS.INVOICES);
}

// ==========================================
// 7. CONFIGURACIÓN DE EMPRESA
// ==========================================
export async function getCompanySettings() {
  return getLocal(LOCAL_STORAGE_KEYS.SETTINGS) || initialCompanySettings;
}

export async function updateCompanySettings(newSettings) {
  setLocal(LOCAL_STORAGE_KEYS.SETTINGS, newSettings);
  return newSettings;
}
