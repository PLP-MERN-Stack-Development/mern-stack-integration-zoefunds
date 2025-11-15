import React, { createContext, useContext, useState } from 'react';
import useApi from '../hooks/useApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const api = useApi();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const res = await api.request({ url: '/auth/login', method: 'post', data: { email, password } });
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);