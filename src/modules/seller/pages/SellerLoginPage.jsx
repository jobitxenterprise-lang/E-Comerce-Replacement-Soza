import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { sellerLoginSchema } from '../schemas/sellerSchemas';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { useAuth } from '../../../shared/context/AuthContext';
import { useToast } from '../../../shared/context/ToastContext';
import { Lock, User, Zap, ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from "../../public/Imagenes/logomoto.png"
export default function SellerLoginPage() {
  const { loginSeller } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const res = await loginSeller(values.username, values.password);
      if (res.success) {
        success('¡Bienvenido al portal de vendedores SOZA!');
        navigate('/vendedor/pedidos');
      } else {
        error(res.message || 'Credenciales inválidas');
      }
    } catch (e) {
      error('Error al iniciar sesión: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] flex flex-col justify-center items-center px-4 py-12 selection:bg-cyan-500 selection:text-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Botón Volver */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors font-sport tracking-wider uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Catálogo
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
          <img src={logo} alt="" />
          
        </div>

        {/* Formulario */}
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={sellerLoginSchema}
          onSubmit={handleLogin}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form className="space-y-4">
              <Input
                label="Usuario de Vendedor"
                name="username"
                placeholder="Ej. carlosm, valeriag, mateom, sofiac"
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

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="soza"
                  size="lg"
                  className="w-full font-sport uppercase tracking-wider text-sm"
                  loading={isSubmitting}
                >
                  Ingresar al Portal de Pedidos
                </Button>
              </div>
            </Form>
          )}
        </Formik>

        {/* Seed Info */}
        <div className="mt-8 pt-5 border-t border-slate-800 text-center font-sport">
          <p className="text-[11px] text-slate-400 font-semibold mb-2">
            Vendedores activos de prueba (Clave: <code className="text-cyan-400 font-mono">vendedor123</code>):
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 text-[11px] text-slate-300">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-mono">carlosm</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-mono">valeriag</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-mono">mateom</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-mono">sofiac</span>
          </div>
        </div>

        {/* Acceso Admin */}
        <div className="mt-5 text-center">
          <Link
            to="/login-admin"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 transition-colors font-sport"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Acceso a Administración General
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
