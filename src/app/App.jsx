import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../shared/context/AuthContext';
import { CartProvider } from '../shared/context/CartContext';
import { ToastProvider } from '../shared/context/ToastContext';
import AppRoutes from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
