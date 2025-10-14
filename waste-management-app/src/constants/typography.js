/**
 * Typography Constants
 * Font sizes, weights, and line heights for consistent text styling
 * Follows CSSE design system specifications
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module Typography
 */

export const typography = {
  // Font families (CSSE specified)
  fontFamily: {
    primary: 'Inter',        // Primary font family as per CSSE rules
    secondary: 'Poppins',    // Alternative font family as per CSSE rules
    system: 'System',        // System fallback
  },
  
  // Font sizes (updated to match CSSE specifications)
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,         // Body/List Items: Regular, ~14-16pt
    lg: 16,         // Body/List Items: Regular, ~14-16pt
    xl: 18,         // Subheadings: Semi-bold, ~18pt
    xxl: 20,
    xxxl: 24,       // Headings: Bold, ~24pt
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
  
  // Text styles for common components (CSSE compliant)
  styles: {
    // Headers (using CSSE specifications)
    h1: {
      fontFamily: 'Inter',
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontFamily: 'Inter',
      fontSize: 24,        // Headings: Bold, ~24pt (CSSE spec)
      fontWeight: '700', 
      lineHeight: 32,
    },
    h3: {
      fontFamily: 'Inter',
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    h4: {
      fontFamily: 'Inter',
      fontSize: 18,        // Subheadings: Semi-bold, ~18pt (CSSE spec)
      fontWeight: '600',
      lineHeight: 24,
    },
    h5: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
    },
    h6: {
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
    
    // Body text (using CSSE specifications)
    body1: {
      fontFamily: 'Inter',
      fontSize: 16,        // Body/List Items: Regular, ~14-16pt (CSSE spec)
      fontWeight: '400',
      lineHeight: 24,
    },
    body2: {
      fontFamily: 'Inter',
      fontSize: 14,        // Body/List Items: Regular, ~14-16pt (CSSE spec)
      fontWeight: '400',
      lineHeight: 20,
    },
    
    // UI text
    button: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
    caption: {
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    overline: {
      fontFamily: 'Inter',
      fontSize: 10,
      fontWeight: '600',
      lineHeight: 16,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    
    // Form elements
    input: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    label: {
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    helper: {
      fontFamily: 'Inter',
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
    
    // CSSE specific styles
    greeting: {
      fontFamily: 'Inter',
      fontSize: 24,        // "Good Morning, Alex!": Bold, ~24pt
      fontWeight: '700',
      lineHeight: 32,
    },
    subheading: {
      fontFamily: 'Inter',
      fontSize: 18,        // "Route Management": Semi-bold, ~18pt
      fontWeight: '600',
      lineHeight: 24,
    },
    listItem: {
      fontFamily: 'Inter',
      fontSize: 16,        // Body/List Items: Regular, ~14-16pt
      fontWeight: '400',
      lineHeight: 24,
    },
  },
};

export default typography;
