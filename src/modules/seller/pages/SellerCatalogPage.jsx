import React, { useState, useEffect, useMemo } from 'react';
import SellerNavbar from '../components/SellerNavbar';
import ProductCard from '../../public/components/ProductCard';
import ProductDetailModal from '../../public/components/ProductDetailModal';
import CartDrawer from '../../public/components/CartDrawer';
import CheckoutModal from '../../public/components/CheckoutModal';
import CategoryFilter from '../../../shared/components/CategoryFilter';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { getProducts, getCategories } from '../../../shared/services/dataService';
import { productCategories as defaultCategories } from '../../../data/seedData';
import { useAuth } from '../../../shared/context/AuthContext';
import { Search, SlidersHorizontal, UserCheck } from 'lucide-react';

export default function SellerCatalogPage() {
  const { currentSeller } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Todos']);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(prodsData || []);
      if (catsData && catsData.length > 0) {
        const catNames = catsData.map(c => c.name || c);
        setCategories(['Todos', ...catNames]);
      } else {
        setCategories(defaultCategories);
      }
    } catch (e) {
      console.error(e);
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products].filter(p => p.active !== false);

    if (selectedCategory !== 'Todos' && selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      <SellerNavbar />

      {/* Banner Vendedor */}
      <div className="bg-[#0b1528] border-b border-cyan-500/30 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm font-sport">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>MODO VENTA MOSTRADOR / ASESOR:</span>
            <span className="text-white font-black">{currentSeller?.name}</span>
          </div>
          <span className="text-slate-400 text-xs hidden sm:inline">
            Tus pedidos levantados se registrarán bajo tu código de vendedor
          </span>
        </div>
      </div>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Barra de Filtros con CategoryFilter */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Buscador de Texto (6 columnas) */}
            <div className="relative md:col-span-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar repuesto de moto para el cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1424] border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-sport"
              />
            </div>

            {/* Selector de Categorías (4 columnas) */}
            <div className="md:col-span-4">
              <CategoryFilter
                productCategories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>

            {/* Ordenar (2 columnas) */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#0d1424] border border-slate-700/80 rounded-xl px-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer font-sport uppercase tracking-wider"
              >
                <option value="default">Recomendados</option>
                <option value="price-asc">Precio: Menor</option>
                <option value="price-desc">Precio: Mayor</option>
                <option value="name">Nombre: A - Z</option>
              </select>
            </div>

          </div>
        </div>

        {/* Grid de Repuestos */}
        {loading ? (
          <LoadingSpinner text="Cargando catálogo de repuestos para vendedor..." />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#0d1424]/40 rounded-2xl border border-slate-800 p-8">
            <SlidersHorizontal className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200 font-sport">No encontramos productos</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modales */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onDirectCheckout={() => setIsCheckoutOpen(true)}
      />

      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        defaultSellerId={currentSeller?.id}
        isSellerMode={true}
      />
    </div>
  );
}
