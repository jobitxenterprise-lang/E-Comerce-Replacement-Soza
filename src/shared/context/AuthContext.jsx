import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateSeller, authenticateAdmin } from '../services/dataService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentSeller, setCurrentSeller] = useState(() => {
    const saved = localStorage.getItem('soza_auth_seller');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const saved = localStorage.getItem('soza_auth_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  // Login Vendedor
  const loginSeller = async (username, password) => {
    setLoading(true);
    try {
      const result = await authenticateSeller(username, password);
      if (result.success) {
        setCurrentSeller(result.seller);
        localStorage.setItem('soza_auth_seller', JSON.stringify(result.seller));
        return { success: true };
      }
      return { success: false, message: result.message };
    } finally {
      setLoading(false);
    }
  };

  const logoutSeller = () => {
    setCurrentSeller(null);
    localStorage.removeItem('soza_auth_seller');
  };

  // Login Admin
  const loginAdmin = async (usernameOrEmail, password) => {
    setLoading(true);
    try {
      const result = await authenticateAdmin(usernameOrEmail, password);
      if (result.success) {
        setCurrentAdmin(result.admin);
        localStorage.setItem('soza_auth_admin', JSON.stringify(result.admin));
        return { success: true };
      }
      return { success: false, message: result.message };
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = () => {
    setCurrentAdmin(null);
    localStorage.removeItem('soza_auth_admin');
  };

  return (
    <AuthContext.Provider
      value={{
        currentSeller,
        isSellerAuthenticated: !!currentSeller,
        loginSeller,
        logoutSeller,
        currentAdmin,
        isAdminAuthenticated: !!currentAdmin,
        loginAdmin,
        logoutAdmin,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
