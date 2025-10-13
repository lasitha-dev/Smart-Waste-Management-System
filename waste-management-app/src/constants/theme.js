/**
 * Theme Constants
 * Defines the color palette and typography styles for the application.
 * Ensures brand consistency across all components.
 */

/**
 * Application Color Palette
 * @constant {Object} COLORS
 */
export const COLORS = {
  // Primary Colors
  primaryDarkTeal: '#005257',
  accentGreen: '#34D399',

  // Alert & Priority Colors
  alertRed: '#EF4444',
  highPriorityRed: '#F87171',

  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#E5E7EB',

  // Background Colors
  cardBackground: '#F9FAFB',
  modalBackground: '#FFFFFF',

  // Progress Bar Gradient
  progressStart: '#34D399',
  progressEnd: '#6EE7B7', // Lighter green for gradient
};

/**
 * Typography Configuration
 * @constant {Object} FONTS
 */
export const FONTS = {
  // Font Families
  family: {
    primary: 'Inter',
    fallback: 'Poppins',
  },

  // Font Sizes
  size: {
    heading: 24,      // For main headings (e.g., "Good Morning, Alex!")
    subheading: 18,   // For subheadings (e.g., "Route Management")
    body: 16,         // For body text and list items
    small: 14,        // For secondary text
  },

  // Font Weights
  weight: {
    regular: '400',
    semiBold: '600',
    bold: '700',
  },
};
