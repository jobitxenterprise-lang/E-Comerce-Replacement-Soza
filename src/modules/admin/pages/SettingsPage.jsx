import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { companySettingsSchema } from '../schemas/adminSchemas';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { getCompanySettings, updateCompanySettings } from '../../../shared/services/dataService';
import { useToast } from '../../../shared/context/ToastContext';
import { Settings, Building2, Phone, Mail, MapPin, MessageSquare, Save, Zap } from 'lucide-react';

export default function SettingsPage() {
  const { success, error } = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getCompanySettings();
      setSettings(data);
    } catch (e) {
      error('Error al cargar configuración: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (values, { setSubmitting }) => {
    try {
      await updateCompanySettings(values);
      success('Configuración de Repuestos SOZA guardada exitosamente.');
      setSettings(values);
    } catch (e) {
      error('Error al guardar ajustes: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Cargando configuración de la empresa..." />;
  }

  const initialValues = {
    company_name: settings?.company_name || 'Repuestos SOZA',
    ruc_nit: settings?.ruc_nit || 'J0310000889211',
    whatsapp_company: settings?.whatsapp_company || '50583898687',
    phone: settings?.phone || '+505 8389-8687',
    email: settings?.email || 'ventas@repuestosoza.com',
    address: settings?.address || 'De la Gasolinera Puma 2c al Norte, Matagalpa, Nicaragua',
    currency: settings?.currency || '$'
  };

  return (
    <div className="space-y-8 max-w-4xl font-sport">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-racing text-slate-100 flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-cyan-400" />
          Configuración General de la Empresa
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Define los datos fiscales de Repuestos SOZA para las facturas PDF y el número de WhatsApp central para recepción de órdenes de vendedores.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-[#0d1424]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={companySettingsSchema}
          onSubmit={handleFormSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Nombre Comercial de la Empresa"
                  name="company_name"
                  icon={Building2}
                  required
                  value={values.company_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.company_name}
                  touched={touched.company_name}
                  helperText="Aparece en la cabecera del catálogo y facturas"
                />

                <Input
                  label="RUC / NIT Fiscal"
                  name="ruc_nit"
                  required
                  value={values.ruc_nit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.ruc_nit}
                  touched={touched.ruc_nit}
                  helperText="Número de identificación tributaria en la factura"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Número de WhatsApp Central (Sin '+' ni espacios)"
                  name="whatsapp_company"
                  icon={MessageSquare}
                  required
                  value={values.whatsapp_company}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.whatsapp_company}
                  touched={touched.whatsapp_company}
                  helperText="Número al que los vendedores envían los pedidos (ej. 50583898687)"
                />

                <Input
                  label="Teléfono de Contacto"
                  name="phone"
                  icon={Phone}
                  required
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.phone}
                  touched={touched.phone}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Correo Electrónico Oficial"
                  name="email"
                  type="email"
                  icon={Mail}
                  required
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  touched={touched.email}
                />

                <Input
                  label="Dirección Física (Matagalpa, Nicaragua)"
                  name="address"
                  icon={MapPin}
                  required
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.address}
                  touched={touched.address}
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <Button
                  type="submit"
                  variant="soza"
                  size="lg"
                  loading={isSubmitting}
                  icon={Save}
                  className="uppercase tracking-wider font-bold"
                >
                  Guardar Configuración
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

    </div>
  );
}
