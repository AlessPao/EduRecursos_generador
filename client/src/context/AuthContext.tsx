import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

// Tipos
interface User {
  id: number;
  nombre: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configurar Axios
  axios.defaults.withCredentials = true;

  // Comprobar si el usuario está autenticado al cargar
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/profile`);
        if (res.data.success) {
          setUser(res.data.usuario);
        }
      } catch (err) {
        // Usuario no autenticado, no mostrar error
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Iniciar sesión
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (res.data.success) {
        setUser(res.data.usuario);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Registrar nuevo usuario
  const register = async (nombre: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_URL}/auth/register`, { nombre, email, password });
      
      if (res.data.success) {
        // Registro exitoso, pero no inicia sesión automáticamente
        return;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      setLoading(true);
      
      await axios.post(`${API_URL}/auth/logout`);
      setUser(null);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Limpiar errores
  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};