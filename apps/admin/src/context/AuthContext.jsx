import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sankara_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      const token = localStorage.getItem('sankara_admin_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.user.role === 'cmo') {
            setUser(res.data.user);
            localStorage.setItem('sankara_admin_user', JSON.stringify(res.data.user));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
    verify();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, tokens } = res.data;

    if (userData.role !== 'cmo') {
      throw new Error('Access denied. Administrator privileges required to access Admin Console.');
    }

    localStorage.setItem('sankara_admin_token', tokens.accessToken);
    localStorage.setItem('sankara_admin_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('sankara_admin_token');
    localStorage.removeItem('sankara_admin_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
