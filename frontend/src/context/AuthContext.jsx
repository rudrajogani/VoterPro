// ✅ AuthContext.js (Refactored)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateUser, registerUser, getCurrentUser, setCurrentUser } from '../utils/auth';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setAuthLoading(false);
  }, []);

  const login = async (aadhaarNumber, password) => {
    setAuthLoading(true);
    try {
      const authenticatedUser = await authenticateUser(aadhaarNumber, password);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        setCurrentUser(authenticatedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (userData) => {
    setAuthLoading(true);
    try {
      const newUser = await registerUser(userData);
      if (newUser) {
        setUser(newUser);
        setCurrentUser(newUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};