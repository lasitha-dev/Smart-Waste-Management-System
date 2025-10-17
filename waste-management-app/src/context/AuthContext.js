/**
 * AuthContext
 * Manages authentication state and role-based access control
 * Supports Admin (scheduling) and Crew (bin collection) roles
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

/**
 * User roles in the system
 */
export const USER_ROLES = {
  ADMIN: 'admin',  // Scheduling & management access
  CREW: 'crew',    // Bin collection & routes access
};

/**
 * Mock users for authentication
 */
const MOCK_USERS = {
  admin: {
    id: 'admin-001',
    email: 'admin@waste.com',
    password: 'admin123',
    name: 'Admin User',
    role: USER_ROLES.ADMIN,
    avatar: '👨‍💼',
  },
  crew: {
    id: 'crew-001',
    email: 'crew@waste.com',
    password: 'crew123',
    name: 'John Smith',
    role: USER_ROLES.CREW,
    avatar: '👷',
  },
};

/**
 * AuthProvider Component
 * Wraps the app to provide authentication context
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Load stored auth state on mount
   */
  useEffect(() => {
    loadStoredAuth();
  }, []);

  /**
   * Load authentication state from AsyncStorage
   */
  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('auth_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user with email, password, and role
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role (admin or crew)
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  const login = async (email, password, role) => {
    try {
      // Find user matching the credentials and role
      const mockUser = Object.values(MOCK_USERS).find(
        u => u.email === email && u.password === password && u.role === role
      );

      if (!mockUser) {
        return {
          success: false,
          message: 'Invalid credentials or incorrect role selected',
        };
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = mockUser;

      // Store auth state
      await AsyncStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      
      setUser(userWithoutPassword);
      setIsAuthenticated(true);

      return {
        success: true,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login',
      };
    }
  };

  /**
   * Quick login with just role (for demo/testing)
   * @param {string} role - User role
   */
  const quickLogin = async (role) => {
    try {
      const mockUser = MOCK_USERS[role];
      if (!mockUser) {
        return { success: false, message: 'Invalid role' };
      }

      const { password: _, ...userWithoutPassword } = mockUser;
      await AsyncStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      
      setUser(userWithoutPassword);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Quick login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Switch user role (for demo purposes)
   * @param {string} newRole - New role to switch to
   */
  const switchRole = async (newRole) => {
    await logout();
    await quickLogin(newRole);
  };

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  const isAdmin = () => hasRole(USER_ROLES.ADMIN);

  /**
   * Check if user is crew
   * @returns {boolean}
   */
  const isCrew = () => hasRole(USER_ROLES.CREW);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    quickLogin,
    logout,
    switchRole,
    hasRole,
    isAdmin,
    isCrew,
    USER_ROLES,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
