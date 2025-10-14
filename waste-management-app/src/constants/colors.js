/**
 * Color Constants
 * Centralized color scheme for the Smart Waste Management System
 * Follows CSSE design system specifications
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module Colors
 */

// CSSE Color Palette - Primary brand colors
export const colors = {
  // Primary Dark Teal - Used for headers, backgrounds
  primary: '#005257',
  primaryLight: '#1a7175',
  primaryDark: '#003a3c',
  
  // Accent Green - Used for primary buttons, success states, icons
  accent: '#34D399',
  accentLight: '#6ee7b7',
  accentDark: '#10b981',
  
  // Alert and Priority colors
  alert: '#EF4444',        // Alert Red - Used for issue tags and error states
  alertLight: '#f87171',
  alertDark: '#dc2626',
  
  highPriority: '#F87171', // High Priority Red - Used for 'high' tag on list items
  
  // Semantic colors (using CSSE palette)
  success: '#34D399',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#005257',
  
  // Status colors for bins (using CSSE palette)
  binActive: '#34D399',
  binInactive: '#9CA3AF',
  binMaintenance: '#FBBF24',
  binFull: '#EF4444',
  binUrgent: '#F87171',
  
  // Fill level indicators (using CSSE palette)
  fillLow: '#34D399',     // 0-30%
  fillMedium: '#FBBF24',  // 31-70%
  fillHigh: '#EF4444',    // 71-100%
  
  // Background colors (CSSE specified)
  background: '#FFFFFF',           // Modal Background (White)
  surface: '#F9FAFB',             // Card Background (Off-White)
  surfaceVariant: '#F3F4F6',
  
  // Text colors (CSSE specified)
  textPrimary: '#FFFFFF',         // Text Primary (White)
  textSecondary: '#E5E7EB',       // Text Secondary (Light Gray)
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onSurface: '#1F2937',
  onBackground: '#1F2937',
  
  // Content colors
  text: '#1F2937',
  textLight: '#6B7280',
  textDisabled: '#9CA3AF',
  textHint: '#D1D5DB',
  
  // Border and divider colors
  border: '#E5E7EB',
  divider: '#F3F4F6',
  outline: '#9CA3AF',
  
  // Interactive states
  disabled: '#9CA3AF',
  disabledBackground: '#F9FAFB',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  scrim: 'rgba(0, 0, 0, 0.6)',
  
  // Toast notification colors (updated with CSSE palette)
  toastSuccess: '#D1FAE5',
  toastWarning: '#FEF3C7',
  toastError: '#FEE2E2',
  toastInfo: '#E0F2FE',
  
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
  background: '#1F2937',
  surface: '#374151',
  text: '#FFFFFF',
  textSecondary: '#D1D5DB',
  border: '#4B5563',
  onSurface: '#FFFFFF',
  onBackground: '#FFFFFF',
};

// Gradient definitions (using CSSE colors)
export const gradients = {
  primary: ['#005257', '#003a3c'],
  accent: ['#34D399', '#10b981'],
  success: ['#34D399', '#10b981'],
  warning: ['#FBBF24', '#F59E0B'],
  error: ['#EF4444', '#DC2626'],
  urgent: ['#F87171', '#EF4444'],
  // Progress Bar gradient as specified in CSSE rules
  progressBar: ['#34D399', '#6ee7b7'],
};

// Component-specific color schemes
export default colors;
