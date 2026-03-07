import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axios';

export interface Address {
  fullName?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  cardType?: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  gender?: string;
  dateOfBirth?: string;
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  updateProfile: (userData: FormData | Partial<User>) => Promise<any>;
  fetchProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra localStorage khi app khởi động
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const userData = response.data.data;
        setToken(userData.token);
        setUser(userData);
        
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (userData: FormData | Partial<User>) => {
    try {
      const response = await axios.put(
        '/auth/profile',
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(userData instanceof FormData ? {} : { 'Content-Type': 'application/json' })
          }
        }
      );

      if (response.data.success) {
        const updatedUser = response.data.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (updatedUser.token) {
          setToken(updatedUser.token);
          localStorage.setItem('token', updatedUser.token);
        }
        return { success: true, data: updatedUser };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Update failed' 
      };
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/auth/profile');
      if (response.data.success && response.data.data) {
        const fullUser = response.data.data;
        setUser(fullUser);
        localStorage.setItem('user', JSON.stringify(fullUser));
        return fullUser;
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateProfile, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};