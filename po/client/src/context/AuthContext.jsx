import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('studyshare-token');
    const savedUser = localStorage.getItem('studyshare-user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('studyshare-user');
      }
    }
    // Verify token is still valid
    api.get('/auth/me')
      .then(res => {
        setUser(res.data);
        localStorage.setItem('studyshare-user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('studyshare-token');
        localStorage.removeItem('studyshare-user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: u, token } = res.data;
    localStorage.setItem('studyshare-token', token);
    localStorage.setItem('studyshare-user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { user: u, token } = res.data;
    localStorage.setItem('studyshare-token', token);
    localStorage.setItem('studyshare-user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('studyshare-token');
    localStorage.removeItem('studyshare-user');
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('studyshare-user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
