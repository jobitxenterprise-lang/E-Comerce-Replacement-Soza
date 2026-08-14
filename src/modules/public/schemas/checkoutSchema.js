import * as Yup from 'yup';

export const checkoutValidationSchema = Yup.object().shape({
  client_name: Yup.string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .required('El nombre del cliente es obligatorio'),
  seller_id: Yup.string()
    .required('Debes seleccionar un vendedor para asignar tu pedido')
});
