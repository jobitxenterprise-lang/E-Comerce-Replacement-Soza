import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { productValidationSchema } from '../schemas/adminSchemas';
import Input from '../../../shared/components/Input';
import Select from '../../../shared/components/Select';
import Button from '../../../shared/components/Button';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { getProducts, addProduct, updateProduct } from '../../../shared/services/dataService';
import { productCategories } from '../../../data/seedData';
import { useToast } from '../../../shared/context/ToastContext';
import { PlusCircle, Edit, Zap, Image, Package, DollarSign, Wrench, X } from 'lucide-react';

export default function AddProductPage() {
  const { success, error } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (e) {
      error('Error al cargar productos: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const initialValues = editingProduct
    ? {
        name: editingProduct.name || '',
        category: editingProduct.category || 'Llantas & Neumáticos',
        price: editingProduct.price || '',
        cost_price: editingProduct.cost_price || '',
        stock: editingProduct.stock !== undefined ? editingProduct.stock : '',
        description: editingProduct.description || '',
        image_url: editingProduct.image_url || '',
        active: editingProduct.active !== false
      }
    : {
        name: '',
        category: 'Llantas & Neumáticos',
        price: '',
        cost_price: '',
        stock: 10,
        description: '',
        image_url: '',
        active: true
      };

  const handleFormSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          ...values,
          price: Number(values.price),
          cost_price: Number(values.cost_price),
          stock: Number(values.stock)
        });
        success(`Repuesto "${values.name}" actualizado exitosamente.`);
        setEditingProduct(null);
      } else {
        await addProduct({
          ...values,
          price: Number(values.price),
          cost_price: Number(values.cost_price),
          stock: Number(values.stock)
        });
        success(`Nuevo repuesto "${values.name}" agregado al catálogo.`);
      }
      resetForm();
      loadProducts();
    } catch (err) {
      error('Error al guardar producto: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = productCategories
    .filter(c => c !== 'Todos')
    .map(c => ({ value: c, label: c }));

  return (
    <div className="space-y-8">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-racing text-slate-100 flex items-center gap-2.5">
          <PlusCircle className="w-7 h-7 text-cyan-400" />
          {editingProduct ? 'Editar producto ' : 'Agregar Prducto'}
        </h1>
       
      </div>

      {/* Formulario */}
      <div className="bg-[#0d1424]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800 font-sport">
          <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
            {editingProduct ? 'Modificando Ficha Técnica' : 'Ficha del Repuesto / Accesorio'}
          </span>
          {editingProduct && (
            <button
              onClick={() => setEditingProduct(null)}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancelar Edición
            </button>
          )}
        </div>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={productValidationSchema}
          onSubmit={handleFormSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Nombre del Repuesto / Accesorio / Modelo"
                  name="name"
                  placeholder="Ej. Llanta TRX Tires 130/70-17 o Pistón Everestt 150cc"
                  required
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.name}
                  touched={touched.name}
                />

                <Select
                  label="Categoría"
                  name="category"
                  required
                  options={categoryOptions}
                  value={values.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.category}
                  touched={touched.category}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Input
                  label="Precio de Venta ($ USD)"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="45.00"
                  icon={DollarSign}
                  required
                  value={values.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.price}
                  touched={touched.price}
                />

                <Input
                  label="Costo de Proveedor / Importación ($)"
                  name="cost_price"
                  type="number"
                  step="0.01"
                  placeholder="28.00"
                  icon={DollarSign}
                  required
                  value={values.cost_price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.cost_price}
                  touched={touched.cost_price}
                  helperText="Para control de utilidad y reportes"
                />

                <Input
                  label="Stock Inicial en Tienda"
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="20"
                  icon={Package}
                  required
                  value={values.stock}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.stock}
                  touched={touched.stock}
                />
              </div>

              <Input
                label="URL de la Foto del Repuesto (Opcional)"
                name="image_url"
                placeholder="https://..."
                icon={Image}
                value={values.image_url}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.image_url}
                touched={touched.image_url}
                helperText="Enlace directo a la imagen del repuesto en formato JPG o PNG"
              />

              {/* Textarea Descripción */}
              <div className="flex flex-col gap-1.5 font-sport">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Especificaciones Técnicas y Compatibilidad <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Describe compatibilidad (motos 125cc, 150cc, 200cc), marca OEM, material y detalles de instalación..."
                  className={`w-full bg-[#080d18] text-slate-100 placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 text-sm transition-all border outline-none
                    ${touched.description && errors.description
                      ? 'border-red-500/80 focus:border-red-500'
                      : 'border-slate-700/80 focus:border-cyan-500'
                    }
                  `}
                />
                {touched.description && errors.description && (
                  <span className="text-xs text-red-400 font-medium">
                    {errors.description}
                  </span>
                )}
              </div>

              {/* Botón Guardar */}
              <div className="flex items-center justify-end gap-3 pt-2 font-sport">
                {editingProduct && (
                  <Button
                    variant="secondary"
                    onClick={() => setEditingProduct(null)}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="soza"
                  size="lg"
                  loading={isSubmitting}
                  icon={null}
                  className="uppercase tracking-wider font-bold"
                >
                  {editingProduct ? 'Actualizar ' : 'Guardar y Publicar en Catálogo'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* Lista de Repuestos */}
      <div className="space-y-4 font-sport">
        <h2 className="text-xl font-bold font-racing text-slate-100">
          Repuestos Registrados en Inventario ({products.length})
        </h2>

        {loading ? (
          <LoadingSpinner text="Cargando repuestos..." />
        ) : (
          <div className="bg-[#0d1424]/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#080d18] text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Foto</th>
                    <th className="p-4">Nombre / Modelo</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4 text-right">Precio Venta</th>
                    <th className="p-4 text-right">Costo</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <img
                          src={p.image_url || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-[#080d18]"
                        />
                      </td>
                      <td className="p-4 font-bold text-slate-100">
                        {p.name}
                      </td>
                      <td className="p-4 text-cyan-400">
                        {p.category}
                      </td>
                      <td className="p-4 text-right font-black text-cyan-400 font-mono">
                        ${Number(p.price || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-mono text-slate-400">
                        ${Number(p.cost_price || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold font-mono
                            ${Number(p.stock) <= 0
                              ? 'bg-red-950 text-red-300 border border-red-600/40'
                              : Number(p.stock) <= 5
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-200'
                            }
                          `}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit}
                          onClick={() => {
                            setEditingProduct(p);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
