import { supabase, isSupabaseConfigured } from './supabaseClient';
import { initialProducts, initialSellers, initialAdmins, initialCompanySettings, productCategories } from '../../data/seedData';

const LOCAL_STORAGE_KEYS = {
  CATEGORIES: 'soza_moto_categories_v2',
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
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES)) {
    const defaultCategories = productCategories.filter(c => c !== 'Todos').map((name, idx) => ({
      id: `cat-000${idx + 1}`,
      name,
      active: true
    }));
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  }
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
// 1. CATEGORÍAS
// ==========================================
export async function getCategories() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });
      if (!error && data && data.length > 0) {
        setLocal(LOCAL_STORAGE_KEYS.CATEGORIES, data);
        return data;
      }
    } catch (e) {
      console.warn('Fallback a categorías locales:', e);
    }
  }
  return getLocal(LOCAL_STORAGE_KEYS.CATEGORIES);
}

export async function addCategory(categoryData) {
  const newCat = {
    id: 'cat-' + crypto.randomUUID(),
    active: true,
    created_at: new Date().toISOString(),
    ...categoryData
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([newCat])
        .select()
        .single();
      if (!error && data) {
        const local = getLocal(LOCAL_STORAGE_KEYS.CATEGORIES);
        setLocal(LOCAL_STORAGE_KEYS.CATEGORIES, [...local, data]);
        return data;
      }
    } catch (e) {
      console.warn('Error Supabase addCategory:', e);
    }
  }

  const local = getLocal(LOCAL_STORAGE_KEYS.CATEGORIES);
  setLocal(LOCAL_STORAGE_KEYS.CATEGORIES, [...local, newCat]);
  return newCat;
}

// ==========================================
// 1.5. STORAGE (IMÁGENES)
// ==========================================
export async function uploadProductImage(file) {
  if (!isSupabaseConfigured) throw new Error("Supabase no está configurado.");
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('public-imagen')
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(`Error al subir imagen: ${uploadError.message}. Asegúrate de crear el bucket "public-imagen" público.`);
  }

  const { data } = supabase.storage
    .from('public-imagen')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// ==========================================
// 2. PRODUCTOS
// ==========================================
export async function getProducts() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
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
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, id: newProduct.id }])
        .select()
        .single();
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
  if (isSupabaseConfigured) {
    try {
      await supabase.rpc('decrease_product_stock', {
        p_product_id: productId,
        p_qty: Number(qty || 0)
      });
    } catch (e) {
      console.warn('Error RPC decrease_product_stock:', e);
    }
  }
  const products = getLocal(LOCAL_STORAGE_KEYS.PRODUCTS);
  const prod = products.find(p => p.id === productId);
  if (prod) {
    const updatedStock = Math.max(0, Number(prod.stock || 0) - Number(qty || 0));
    await updateProduct(productId, { stock: updatedStock });
  }
}

// ==========================================
// 3. VENDEDORES & AUTENTICACIÓN (SUPABASE AUTH + TABLA)
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

export async function authenticateSeller(usernameOrEmail, password) {
  if (isSupabaseConfigured) {
    try {
      // 1. Intentar con Supabase Auth (JWT)
      const email = usernameOrEmail.includes('@') ? usernameOrEmail.trim() : `${usernameOrEmail.trim()}@repuestosoza.com`;
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: email,
        password: password.trim()
      });

      if (!authErr && authData?.user) {
        const metadata = authData.user.user_metadata || {};
        const extractedUsername = metadata.username || usernameOrEmail.split('@')[0].trim();
        
        // Buscar su ID real en la tabla sellers para que coincida con los pedidos
        const { data: dbSeller } = await supabase
          .from('sellers')
          .select('*')
          .ilike('username', extractedUsername)
          .single();

        return {
          success: true,
          seller: {
            id: dbSeller ? dbSeller.id : authData.user.id,
            email: authData.user.email,
            name: dbSeller ? dbSeller.name : (metadata.name || usernameOrEmail),
            username: dbSeller ? dbSeller.username : extractedUsername,
            zone: dbSeller ? dbSeller.zone : (metadata.zone || 'Zona Centro - Norte'),
            role: 'seller'
          }
        };
      }

      // 2. Si falla Auth, consultar en tabla sellers
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .ilike('username', usernameOrEmail.trim())
        .eq('password', password.trim())
        .eq('active', true)
        .single();
      if (!error && data) {
        return { success: true, seller: data };
      }
    } catch (e) {
      console.warn('Error auth Supabase vendedor, probando local:', e);
    }
  }

  const sellers = getLocal(LOCAL_STORAGE_KEYS.SELLERS);
  const seller = sellers.find(
    s => (s.username.toLowerCase() === usernameOrEmail.trim().toLowerCase()) && 
         (s.password === password.trim()) && 
         s.active !== false
  );
  if (seller) {
    return { success: true, seller };
  }
  return { success: false, message: 'Usuario o contraseña de vendedor incorrectos.' };
}

// ==========================================
// 4. ADMINISTRADOR & AUTENTICACIÓN (SUPABASE AUTH + FALLBACK)
// ==========================================
export async function authenticateAdmin(usernameOrEmail, password) {
  if (isSupabaseConfigured) {
    try {
      // 1. Intentar con Supabase Auth (JWT)
      const email = usernameOrEmail.includes('@') ? usernameOrEmail.trim() : `${usernameOrEmail.trim()}@repuestosoza.com`;
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: email,
        password: password.trim()
      });

      if (!authErr && authData?.user) {
        const metadata = authData.user.user_metadata || {};
        return {
          success: true,
          admin: {
            id: authData.user.id,
            email: authData.user.email,
            name: metadata.name || 'Administrador General',
            username: metadata.username || 'admin',
            role: metadata.role || 'admin'
          }
        };
      }
    } catch (e) {
      console.warn('Error en Supabase Auth Admin, probando fallback:', e);
    }
  }

  // Fallback con credenciales predeterminadas o locales
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
// 5. PEDIDOS (Tabla "Pedido" - Vendedor / Público)
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
  if (isSupabaseConfigured) {
    try {
      const { data: dbOrders, error: orderErr } = await supabase
        .from('orders')
        .select(`
          *,
          seller:sellers(*),
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (!orderErr && dbOrders && dbOrders.length > 0) {
        return dbOrders.map(o => ({
          ...o,
          seller_name: o.seller ? o.seller.name : 'No Asignado'
        }));
      }
    } catch (e) {
      console.warn('Fallback a pedidos locales:', e);
    }
  }

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
  if (newStatus === 'enviado' && targetOrder) {
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
// 6. PEDIDOS ADMIN (Tabla "PedidoAdmin")
// ==========================================
export async function getAdminOrders() {
  if (isSupabaseConfigured) {
    try {
      const { data: dbAdminOrders, error } = await supabase
        .from('admin_orders')
        .select(`
          *,
          seller:sellers(*),
          items:admin_order_items(*),
          original_order:orders(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && dbAdminOrders && dbAdminOrders.length > 0) {
        return dbAdminOrders.map(ao => ({
          ...ao,
          seller_name: ao.seller ? ao.seller.name : 'Venta Directa'
        }));
      }
    } catch (e) {
      console.warn('Fallback a pedidos admin locales:', e);
    }
  }

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

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('admin_orders')
        .update({ adjusted_total: newTotal, edited_by_admin: true })
        .eq('id', adminOrderId);

      for (const it of updatedItems) {
        await supabase
          .from('admin_order_items')
          .update({
            adjusted_quantity: it.adjusted_quantity,
            subtotal: it.adjusted_quantity * Number(it.unit_price || 0)
          })
          .eq('admin_order_id', adminOrderId)
          .eq('product_id', it.product_id);
      }
    } catch (e) {
      console.warn('Error Supabase updateAdminOrderItems:', e);
    }
  }

  return { success: true, newTotal };
}

export async function updateAdminOrderStatus(adminOrderId, newStatus) {
  const adminOrders = getLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDERS);
  const target = adminOrders.find(ao => ao.id === adminOrderId);

  const updated = adminOrders.map(ao => ao.id === adminOrderId ? { ...ao, status: newStatus } : ao);
  setLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDERS, updated);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('admin_orders').update({ status: newStatus }).eq('id', adminOrderId);
    } catch (e) {
      console.warn('Error Supabase updateAdminOrderStatus:', e);
    }
  }

  let generatedInvoice = null;

  if (newStatus === 'facturado' && target) {
    const adminOrderItems = getLocal(LOCAL_STORAGE_KEYS.ADMIN_ORDER_ITEMS).filter(it => it.admin_order_id === adminOrderId);
    const sellers = getLocal(LOCAL_STORAGE_KEYS.SELLERS);
    const seller = sellers.find(s => s.id === target.seller_id);
    const company = await getCompanySettings();

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

    if (isSupabaseConfigured) {
      try {
        await supabase.from('invoices').insert([generatedInvoice]);
      } catch (e) {
        console.warn('Error Supabase insert invoice:', e);
      }
    }
  }

  return { success: true, newStatus, invoice: generatedInvoice };
}

// ==========================================
// 7. FACTURAS
// ==========================================
export async function getInvoices() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocal(LOCAL_STORAGE_KEYS.INVOICES, data);
        return data;
      }
    } catch (e) {
      console.warn('Fallback a facturas locales:', e);
    }
  }
  return getLocal(LOCAL_STORAGE_KEYS.INVOICES);
}

// ==========================================
// 8. CONFIGURACIÓN DE EMPRESA
// ==========================================
export async function getCompanySettings() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('value')
        .eq('key', 'general')
        .single();
      if (!error && data && data.value) {
        setLocal(LOCAL_STORAGE_KEYS.SETTINGS, data.value);
        return data.value;
      }
    } catch (e) {
      console.warn('Fallback a configuración local:', e);
    }
  }
  return getLocal(LOCAL_STORAGE_KEYS.SETTINGS) || initialCompanySettings;
}

export async function updateCompanySettings(newSettings) {
  setLocal(LOCAL_STORAGE_KEYS.SETTINGS, newSettings);
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('company_settings')
        .upsert({ key: 'general', value: newSettings, updated_at: new Date().toISOString() });
    } catch (e) {
      console.warn('Error Supabase updateCompanySettings:', e);
    }
  }
  return newSettings;
}
