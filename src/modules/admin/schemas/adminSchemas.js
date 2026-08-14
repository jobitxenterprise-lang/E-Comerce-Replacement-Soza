import * as Yup from 'yup';

export const adminLoginSchema = Yup.object().shape({
  username: Yup.string()
    .trim()
    .required('El usuario o correo del administrador es obligatorio'),
  password: Yup.string()
    .required('La contraseña de administrador es obligatoria')
});

export const productValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(120, 'El nombre no puede exceder 120 caracteres')
    .required('El nombre del producto es obligatorio'),
  category: Yup.string()
    .required('Debes seleccionar una categoría'),
  price: Yup.number()
    .typeError('El precio de venta debe ser un número')
    .positive('El precio debe ser mayor a 0')
    .required('El precio de venta es obligatorio'),
  cost_price: Yup.number()
    .typeError('El costo del proveedor debe ser un número')
    .min(0, 'El costo no puede ser negativo')
    .required('El costo del proveedor es obligatorio'),
  stock: Yup.number()
    .typeError('El stock debe ser un número entero')
    .integer('Debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .required('El stock inicial es obligatorio'),
  description: Yup.string()
    .trim()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .required('La descripción es obligatoria'),
  image_url: Yup.string()
    .url('Debe ser una URL válida')
    .nullable()
});

export const companySettingsSchema = Yup.object().shape({
  company_name: Yup.string()
    .trim()
    .min(2, 'El nombre de la empresa es obligatorio')
    .required('El nombre de la empresa es obligatorio'),
  ruc_nit: Yup.string()
    .trim()
    .required('El RUC / NIT fiscal es obligatorio'),
  whatsapp_company: Yup.string()
    .trim()
    .matches(/^[0-9]+$/, 'El número de WhatsApp solo debe contener dígitos numéricos con código de país')
    .required('El número de WhatsApp central es obligatorio'),
  phone: Yup.string()
    .trim()
    .required('El teléfono es obligatorio'),
  email: Yup.string()
    .email('Debe ser un correo electrónico válido')
    .required('El correo electrónico es obligatorio'),
  address: Yup.string()
    .trim()
    .required('La dirección es obligatoria')
});
