import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('chatapp_token'));
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('chatapp_token');
      if (savedToken) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data);
          setToken(savedToken);
        } catch {
          localStorage.removeItem('chatapp_token');
          localStorage.removeItem('chatapp_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('chatapp_token', data.token);
      localStorage.setItem('chatapp_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.username}!`);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    try {
      const { data } = await authAPI.register({ username, email, password });
      localStorage.setItem('chatapp_token', data.token);
      localStorage.setItem('chatapp_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome, ${data.user.username}! 🎉`);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('chatapp_token');
    localStorage.removeItem('chatapp_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      const { data } = await authAPI.updateProfile(updates);
      setUser(data);
      localStorage.setItem('chatapp_user', JSON.stringify(data));
      toast.success('Profile updated!');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Update failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
