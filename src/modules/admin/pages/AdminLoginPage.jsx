import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { adminLoginSchema } from '../schemas/adminSchemas';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { useAuth } from '../../../shared/context/AuthContext';
import { useToast } from '../../../shared/context/ToastContext';
import { ShieldCheck, Lock, User, ArrowLeft, KeyRound, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const res = await loginAdmin(values.username, values.password);
      if (res.success) {
        success('¡Acceso concedido al Panel de Administración SOZA!');
        navigate('/admin/recibir-pedidos');
      } else {
        error(res.message || 'Credenciales de administrador incorrectas');
      }
    } catch (e) {
      error('Error de autenticación: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] flex flex-col justify-center items-center px-4 py-12 selection:bg-cyan-500 selection:text-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />

      {/* Botón Volver */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors font-sport uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la Tienda
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#0d1424]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl soza-card-glow"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-cyan-500/20">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-racing text-slate-100">
            REPUESTOS SOZA
          </h2>
          <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider font-sport mt-1">
            Panel de Administración y Facturación
          </p>
        </div>

        {/* Formulario */}
        <Formik
          initialValues={{
            username: import.meta.env.VITE_ADMIN_USER || 'admin',
            password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
          }}
          validationSchema={adminLoginSchema}
          onSubmit={handleLogin}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form className="space-y-4">
              <Input
                label="Usuario o Correo de Administrador"
                name="username"
                placeholder="admin o admin@repuestosoza.com"
                icon={User}
                required
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.username}
                touched={touched.username}
              />

              <Input
                label="Contraseña"
                name="password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                required
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
              />

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="soza"
                  size="lg"
                  className="w-full font-sport uppercase tracking-wider text-sm font-bold"
                  loading={isSubmitting}
                  icon={KeyRound}
                >
                  Ingresar a Administración
                </Button>
              </div>
            </Form>
          )}
        </Formik>

        {/* Demo info */}
        <div className="mt-8 pt-5 border-t border-slate-800 text-center font-sport">
          <p className="text-[11px] text-slate-400 font-semibold">
            Credenciales de administrador por defecto:
          </p>
          <div className="mt-1.5 bg-[#080d18] p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
            <span>Usuario: <strong className="text-cyan-400">admin</strong></span> | <span>Clave: <strong className="text-cyan-400">admin123</strong></span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
