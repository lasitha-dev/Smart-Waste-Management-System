/**
 * Color Constants
 * Centralized color scheme for the Smart Waste Management System
 * Follows Material Design principles with accessibility considerations
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module Colors
 */

// Primary brand colors
export const colors = {
  // Primary green theme - represents nature and sustainability
  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#2E7D32',
  
  // Secondary blue theme - represents technology and trust
  secondary: '#2196F3',
  secondaryLight: '#64B5F6', 
  secondaryDark: '#1565C0',
  
  // Semantic colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Status colors for bins
  binActive: '#4CAF50',
  binInactive: '#9E9E9E',
  binMaintenance: '#FF9800',
  binFull: '#F44336',
  binUrgent: '#E91E63',
  
  // Fill level indicators
  fillLow: '#4CAF50',     // 0-30%
  fillMedium: '#FF9800',  // 31-70%
  fillHigh: '#F44336',    // 71-100%
  
  // Neutral colors
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceVariant: '#FAFAFA',
  
  // Text colors
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onSurface: '#212121',
  onBackground: '#212121',
  
  // Content colors
  text: '#212121',
  textSecondary: '#757575',
  textDisabled: '#9E9E9E',
  textHint: '#BDBDBD',
  
  // Border and divider colors
  border: '#E0E0E0',
  divider: '#E0E0E0',
  outline: '#9E9E9E',
  
  // Interactive states
  disabled: '#9E9E9E',
  disabledBackground: '#F5F5F5',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  scrim: 'rgba(0, 0, 0, 0.6)',
  
  // Toast notification colors
  toastSuccess: '#E8F5E8',
  toastWarning: '#FFF3E0',
  toastError: '#FFEBEE',
  toastInfo: '#E3F2FD',
  
  // Shadow colors
  shadow: '#000000',
  elevation: 'rgba(0, 0, 0, 0.12)',
};

// Theme variants for different modes
export const lightTheme = {
  ...colors,
  // Light theme specific overrides can go here
};

export const darkTheme = {
  ...colors,
  // Dark theme overrides (for future implementation)
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  border: '#2E2E2E',
};

// Gradient definitions
export const gradients = {
  primary: ['#4CAF50', '#2E7D32'],
  secondary: ['#2196F3', '#1565C0'],
  success: ['#4CAF50', '#2E7D32'],
  warning: ['#FF9800', '#E65100'],
  error: ['#F44336', '#C62828'],
  urgent: ['#E91E63', '#AD1457'],
};

// Component-specific color schemes
export default colors;
