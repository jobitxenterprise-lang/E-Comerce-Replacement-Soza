import * as Yup from 'yup';

export const sellerLoginSchema = Yup.object().shape({
  username: Yup.string()
    .trim()
    .required('El usuario de vendedor es obligatorio'),
  password: Yup.string()
    .required('La contraseña es obligatoria')
});

export const sellerDirectOrderSchema = Yup.object().shape({
  client_name: Yup.string()
    .trim()
    .min(3, 'El nombre del cliente debe tener al menos 3 caracteres')
    .required('El nombre del cliente es obligatorio'),
  notes: Yup.string()
    .max(250, 'Máximo 250 caracteres')
});
