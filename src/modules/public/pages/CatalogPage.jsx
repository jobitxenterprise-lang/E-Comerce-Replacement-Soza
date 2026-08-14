import React, { useState, useEffect, useMemo } from 'react';
import PublicNavbar from '../components/PublicNavbar';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import CartDrawer from '../components/CartDrawer';
import CheckoutModal from '../components/CheckoutModal';
import CategoryFilter from '../../../shared/components/CategoryFilter';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { getProducts } from '../../../shared/services/dataService';
import { productCategories, motorcycleBrands } from '../../../data/seedData';
import { Search, Zap, SlidersHorizontal, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CatalogPage({ onOpenSellerLogin }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (e) {
      console.error(e);
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
      {/* Navbar */}
      <PublicNavbar onOpenSellerLogin={onOpenSellerLogin} />

      {/* Hero Section con Estilo Racing & Biker  <section className="relative overflow-hidden pt-10 pb-16 border-b border-slate-800 bg-gradient-to-b from-[#0b1528] via-[#070b12] to-[#070b12]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-950/80 to-red-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold mb-4 font-sport tracking-wider"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>MATAGALPA, NICARAGUA • ESPECIALISTAS EN MOTOS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black font-racing tracking-tight max-w-4xl mx-auto leading-tight"
          >
            REPUESTOS <span className="soza-gradient-text">SOZA</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-sport font-medium leading-relaxed"
          >
            Llantas TRX, Cascos X-SPORS, Baterías, Repuestos de Motor EVERESTT y Accesorios KIGCOL. Haz tu pedido y coordina con nuestros asesores de ventas.
          </motion.p>

          {/* Marcas Patrocinadas 
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-8"
          >
            {motorcycleBrands.map((brand, idx) => (
              <div
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs font-bold text-slate-300 font-sport tracking-wider"
              >
                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${brand.color}`} />
                {brand.name}
              </div>
            ))}
          </motion.div>

          {/* Badges de Confianza 
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-sport"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Garantía de Fábrica OEM</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>Envíos Rápidos en Nicaragua</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>Asesoría Técnica Directa</span>
            </div>
          </motion.div>
        </div>
      </section> */}
     

      {/* Catálogo y Filtros */}
      <main id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Barra de Búsqueda, Selector de Categoría y Ordenar */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Buscador de Texto (6 columnas) */}
            <div className="relative md:col-span-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por llanta, pistón, casco, batería, modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1424] border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-sport"
              />
            </div>

            {/* Selector de Categorías Dropdown (4 columnas) */}
            <div className="md:col-span-4">
              <CategoryFilter
                productCategories={productCategories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>

            {/* Ordenar (2 columnas) 
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
            </div>*/}
          

          </div>
        </div>

        {/* Grid de Productos */}
        {loading ? (
          <LoadingSpinner text="Cargando repuestos y accesorios SOZA..." />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#0d1424]/40 rounded-2xl border border-slate-800 p-8">
            <SlidersHorizontal className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200 font-sport">No encontramos productos con estos filtros</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Intenta buscar por otra categoría o palabra clave como llanta, casco, batería o aceite.
            </p>
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

      {/* Footer */}
      <footer className="bg-[#05080e] border-t border-slate-800 py-10 mt-16 text-center text-xs text-slate-500 font-sport">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-racing text-cyan-400 font-bold text-base tracking-wider">
            REPUESTOS SOZA • MATAGALPA, NICARAGUA
          </p>
          <p className="text-slate-400">
            Distribuidor Oficial: TRX Tires & Batteries • X-SPORS Helmets • EVERESTT OEM • KIGCOL Parts
          </p>
          <p>© {new Date().getFullYear()} Repuestos SOZA. Todos los derechos reservados.</p>
        </div>
      </footer>

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
      />
    </div>
  );
}
