import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Button';
import ProductCard from '../../public/components/ProductCard';
import CategoryFilter from '../../../shared/components/CategoryFilter';
import { updateAdminOrderItems, getProducts, getCategories } from '../../../shared/services/dataService';
import { productCategories as defaultCategories } from '../../../data/seedData';
import { useToast } from '../../../shared/context/ToastContext';
import { Edit3, AlertCircle, Save, Plus, Minus, Search, Trash2, ShoppingBag } from 'lucide-react';

export default function EditOrderItemsModal({
  isOpen,
  onClose,
  adminOrder,
  onSaveSuccess,
  onSave
}) {
  const { success, error } = useToast();
  const [items, setItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState(['Todos']);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isSaving, setIsSaving] = useState(false);
  const [mobileTab, setMobileTab] = useState('catalog');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const [prodsData, catsData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setAllProducts(prodsData || []);
      if (catsData && catsData.length > 0) {
        const catNames = catsData.map(c => c.name || c);
        setCategories(['Todos', ...catNames]);
      } else {
        setCategories(defaultCategories);
      }
    } catch (e) {
      console.warn('Error loading products', e);
    }
  };

  useEffect(() => {
    if (adminOrder && adminOrder.items) {
      setItems(
        adminOrder.items.map(item => ({
          ...item,
          adjusted_quantity: item.adjusted_quantity !== undefined ? item.adjusted_quantity : item.quantity
        }))
      );
    }
  }, [adminOrder]);

  if (!adminOrder) return null;

  const handleQtyChange = (itemId, newQty) => {
    const qty = Math.max(0, parseInt(newQty, 10) || 0);
    setItems(prev =>
      prev.map(it => (it.id === itemId || it.product_id === itemId ? { ...it, adjusted_quantity: qty } : it))
    );
  };

  const handleRemoveItem = (itemId) => {
    setItems(prev => prev.filter(it => it.id !== itemId && it.product_id !== itemId));
  };

  const handleAddProduct = (product) => {
    const exists = items.find(it => it.product_id === product.id);
    if (exists) {
      handleQtyChange(exists.id || exists.product_id, (exists.adjusted_quantity || 0) + 1);
    } else {
      setItems(prev => [
        ...prev,
        {
          id: 'new-' + Date.now(),
          product_id: product.id,
          product_name: product.name,
          original_quantity: 0,
          adjusted_quantity: 1,
          quantity: 1,
          unit_price: product.price,
          subtotal: product.price
        }
      ]);
    }
    success(`${product.name} agregado`);
  };

  const filteredProducts = useMemo(() => {
    let result = [...allProducts].filter(p => p.active !== false);

    if (selectedCategory !== 'Todos' && selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (productSearch.trim()) {
      const q = productSearch.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allProducts, selectedCategory, productSearch]);

  const calculatedTotal = items.reduce(
    (sum, it) => sum + (Number(it.adjusted_quantity || 0) * Number(it.unit_price || 0)),
    0
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(adminOrder.id, items);
      } else {
        await updateAdminOrderItems(adminOrder.id, items);
      }
      success('Cantidades ajustadas guardadas correctamente.');
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (e) {
      error('Error al guardar ajustes: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editando Pedido ${adminOrder.order_number}`}
      maxWidth="max-w-[95vw] lg:max-w-6xl xl:max-w-7xl"
    >
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 font-sport h-[80vh] overflow-hidden pr-1 lg:pr-0">
        
        {/* Selector de Tabs solo para móvil */}
        <div className="flex lg:hidden bg-[#0b1528] p-1.5 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setMobileTab('catalog')}
            className={`flex-1 py-2.5 rounded-lg font-bold transition-all text-xs uppercase tracking-wider ${mobileTab === 'catalog' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500'}`}
          >
            Catálogo
          </button>
          <button
            onClick={() => setMobileTab('cart')}
            className={`flex-1 py-2.5 rounded-lg font-bold transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 ${mobileTab === 'cart' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500'}`}
          >
            Pedido Actual
            <span className="bg-cyan-500 text-black px-1.5 py-0.5 rounded-full text-[10px] leading-none">{items.length}</span>
          </button>
        </div>

        {/* Columna Izquierda: Catálogo Completo */}
        <div className={`lg:col-span-8 xl:col-span-8 flex-col min-h-0 lg:h-full bg-[#0b1528] rounded-2xl border border-slate-800 p-4 ${mobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="mb-4 space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Catálogo de Productos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar producto por nombre..."
                  className="w-full bg-[#080d18] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="w-full">
                <CategoryFilter
                  productCategories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No se encontraron productos
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={() => handleAddProduct(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Resumen del Pedido */}
        <div className={`lg:col-span-4 xl:col-span-4 flex-col min-h-0 lg:h-full ${mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar mb-4">
            {items.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm border border-dashed border-slate-700 rounded-2xl">
                El pedido está vacío. Agrega productos desde el catálogo.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#080d18] border border-slate-800 rounded-2xl p-3 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-100 text-sm block line-clamp-2">
                      {item.product_name || item.name}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.id || item.product_id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors ml-2 flex-shrink-0"
                      title="Eliminar del pedido"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center border border-slate-700 bg-[#070b12] rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id || item.product_id, (item.adjusted_quantity || 0) - 1)}
                        className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={item.adjusted_quantity}
                        onChange={(e) => handleQtyChange(item.id || item.product_id, e.target.value)}
                        className="w-10 bg-transparent text-cyan-300 font-black text-center py-1 text-xs focus:outline-none font-mono"
                      />

                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id || item.product_id, (item.adjusted_quantity || 0) + 1)}
                        className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Subtotal</span>
                      <span className="text-sm font-black text-cyan-400 font-mono">
                        C${(Number(item.adjusted_quantity || 0) * Number(item.unit_price || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totales y Acciones Fijas Abajo */}
          <div className="bg-[#0d1424] p-4 rounded-2xl border border-slate-800 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Final:</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">
                C${calculatedTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSaving}
                className="w-full"
              >
                Cancelar
              </Button>
              <Button
                variant="soza"
                onClick={handleSave}
                loading={isSaving}
                icon={Save}
                className="w-full uppercase tracking-wider font-bold"
              >
                Guardar Ajustes
              </Button>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
}
