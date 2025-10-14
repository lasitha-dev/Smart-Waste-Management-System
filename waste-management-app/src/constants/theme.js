/**
 * UI Theme, Color Palette & Styles
 * Exact design system specifications for Smart Waste Management System
 * 
 * @author Smart Waste Management System
 * @module Theme
 */

/**
 * Color Palette - Exact specifications
 * @constant {Object} COLORS
 */
export const COLORS = {
  // Primary Colors
  primaryDarkTeal: '#005257',    // Used for headers, backgrounds
  accentGreen: '#34D399',        // Used for primary buttons, success states, icons

  // Alert & Priority Colors
  alertRed: '#EF4444',           // Used for issue tags and error states
  highPriorityRed: '#F87171',    // Used for the 'high' tag on list items

  // Text Colors
  textPrimary: '#FFFFFF',        // Text Primary (White)
  textSecondary: '#E5E7EB',      // Text Secondary (Light Gray)

  // Background Colors
  cardBackground: '#F9FAFB',     // Card Background (Off-White)
  modalBackground: '#FFFFFF',    // Modal Background (White)

  // Progress Bar Gradient
  progressStart: '#34D399',      // Accent Green
  progressEnd: '#6EE7B7',        // Lighter green for gradient
};

/**
 * Typography Configuration
 * @constant {Object} FONTS
 */
export const FONTS = {
  // Font Sizes (exact specifications)
  size: {
    heading: 24,        // Headings (e.g., "Good Morning, Alex!"): ~24pt
    subheading: 18,     // Subheadings (e.g., "Route Management"): ~18pt
    body: 16,           // Body/List Items: ~14-16pt (using 16pt)
    bodySmall: 14,      // Body/List Items: ~14-16pt (using 14pt)
    small: 12,          // Small text, captions
  },

  // Font Weights (exact specifications)
  weight: {
    regular: '400',     // Body/List Items: Regular
    semiBold: '600',    // Subheadings: Semi-bold
    bold: '700',        // Headings: Bold
  },
};

/**
 * Component Styles - Exact specifications
 * @constant {Object} STYLES
 */
export const STYLES = {
  // Cards: Use a slight borderRadius (~12px) and a subtle box-shadow
  card: {
    borderRadius: 12,
    backgroundColor: COLORS.cardBackground,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
    padding: 16,
    marginVertical: 8,
  },

  // Buttons: Use a large borderRadius (~10px) with bold text
  button: {
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Primary Button
  primaryButton: {
    backgroundColor: COLORS.accentGreen,
  },

  // Secondary Button
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
  },

  // Button Text
  buttonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },

  secondaryButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.accentGreen,
  },

  // Modals: Should be centered with a semi-transparent backdrop overlay
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent backdrop
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContainer: {
    backgroundColor: COLORS.modalBackground,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Headers
  header: {
    backgroundColor: COLORS.primaryDarkTeal,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  headerTitle: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },

  // Section Titles
  sectionTitle: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 16,
  },

  // Body Text
  bodyText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.regular,
    color: COLORS.primaryDarkTeal,
    lineHeight: 24,
  },

  secondaryText: {
    fontSize: FONTS.size.bodySmall,
    fontWeight: FONTS.weight.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
};

/**
 * Helper function to create consistent text styles
 */
export const createTextStyle = (fontSize, fontWeight, color) => ({
  fontSize,
  fontWeight,
  color,
});

/**
 * Helper function to create consistent button styles
 */
export const createButtonStyle = (backgroundColor, borderColor = null) => ({
  ...STYLES.button,
  backgroundColor,
  ...(borderColor && {
    borderWidth: 2,
    borderColor,
  }),
});

/**
 * Progress Bar Gradient Colors (for gradient libraries)
 */
export const PROGRESS_GRADIENT = [COLORS.progressStart, COLORS.progressEnd];