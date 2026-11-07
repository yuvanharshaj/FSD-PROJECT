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
          // Handled by api interceptor
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

  // Update profile in backend and local state
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      setUser(res.data.user);
      localStorage.setItem('smartpark_user', JSON.stringify(res.data.user));
      toast.success('Profile updated successfully!');
      return { success: true, user: res.data.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Change password with old password verification
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      toast.error(msg);
      return { success: false, message: msg };
    }
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
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume authentication context
export const useAuth = () => useContext(AuthContext);
