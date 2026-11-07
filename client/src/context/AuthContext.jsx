import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Authentication provider managing user session, login, registration, and role checks
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartpark_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartpark_token'));
  const [loading, setLoading] = useState(true);

  // Validate existing token and restore user profile on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('smartpark_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('smartpark_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('Session expired:', err.message);
          logout(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Save session token and user profile
  const saveSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('smartpark_token', newToken);
    localStorage.setItem('smartpark_user', JSON.stringify(newUser));
  };

  // Authenticate user with credentials
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      saveSession(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
      return { success: true, user: res.data.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Register a new user account
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      saveSession(res.data.token, res.data.user);
      toast.success('Account created successfully!');
      return { success: true, user: res.data.user };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Instant one-click demo login for driver or admin
  const demoLogin = async (role = 'user') => {
    const credentials = role === 'admin'
      ? { email: 'admin@smartpark.com', password: 'Admin@123' }
      : { email: 'user@smartpark.com', password: 'User@123' };
    
    return await login(credentials.email, credentials.password);
  };

  // Log user out and clear saved session
  const logout = (showToast = true) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartpark_token');
    localStorage.removeItem('smartpark_user');
    if (showToast) {
      toast.success('Logged out successfully.');
    }
  };

  // Update local user state
  const updateUser = (updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('smartpark_user', JSON.stringify(updated));
      return updated;
    });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        demoLogin,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume authentication context
export const useAuth = () => useContext(AuthContext);
