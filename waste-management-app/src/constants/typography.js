/**
 * Typography Constants
 * Font sizes, weights, and line heights for consistent text styling
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module Typography
 */

export const typography = {
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32,
    hero: 40,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  
  // Line heights (relative to font size)
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  // Text styles for common components
  styles: {
    // Headers
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700', 
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    h5: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
    },
    h6: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
    
    // Body text
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    
    // UI text
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    overline: {
      fontSize: 10,
      fontWeight: '600',
      lineHeight: 16,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    
    // Form elements
    input: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    helper: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    
    // Special text
    monospace: {
      fontFamily: 'monospace',
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
  },
};

export default typography;
