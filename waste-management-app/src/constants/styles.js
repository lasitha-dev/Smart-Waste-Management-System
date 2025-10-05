/**
 * Common Styles
 * Reusable style definitions for consistent UI components
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module CommonStyles
 */

import { StyleSheet, Platform } from 'react-native';
import colors from './colors';
import spacing from './spacing';
import typography from './typography';

export const commonStyles = StyleSheet.create({
  // Layout styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  cardElevated: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Button styles
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  buttonSecondary: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  
  // Text styles
  buttonText: {
    ...typography.styles.button,
    color: colors.onPrimary,
  },
  
  buttonTextSecondary: {
    ...typography.styles.button,
    color: colors.onSecondary,
  },
  
  buttonTextOutline: {
    ...typography.styles.button,
    color: colors.primary,
  },
  
  buttonTextDisabled: {
    ...typography.styles.button,
    color: colors.onPrimary,
  },
  
  // Header styles
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  
  headerTitle: {
    ...typography.styles.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  
  headerSubtitle: {
    ...typography.styles.body2,
    color: colors.textSecondary,
  },
  
  // Section styles
  section: {
    padding: spacing.md,
  },
  
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  sectionSubtitle: {
    ...typography.styles.body2,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  
  // Form styles
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.styles.input,
    color: colors.text,
  },
  
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  
  label: {
    ...typography.styles.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  
  errorText: {
    ...typography.styles.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  
  helperText: {
    ...typography.styles.helper,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  // List styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  
  listItemLast: {
    borderBottomWidth: 0,
  },
  
  // Spacing utilities
  marginTop: {
    marginTop: spacing.md,
  },
  
  marginBottom: {
    marginBottom: spacing.md,
  },
  
  marginVertical: {
    marginVertical: spacing.md,
  },
  
  marginHorizontal: {
    marginHorizontal: spacing.md,
  },
  
  paddingTop: {
    paddingTop: spacing.md,
  },
  
  paddingBottom: {
    paddingBottom: spacing.md,
  },
  
  paddingVertical: {
    paddingVertical: spacing.md,
  },
  
  paddingHorizontal: {
    paddingHorizontal: spacing.md,
  },
  
  // Status styles
  statusSuccess: {
    backgroundColor: colors.toastSuccess,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  
  statusWarning: {
    backgroundColor: colors.toastWarning,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  
  statusError: {
    backgroundColor: colors.toastError,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  
  statusInfo: {
    backgroundColor: colors.toastInfo,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  
  // Platform specific styles
  ...Platform.select({
    ios: {
      statusBarPadding: {
        paddingTop: 44, // iOS status bar height
      },
    },
    android: {
      statusBarPadding: {
        paddingTop: 24, // Android status bar height
      },
    },
  }),
});

export default commonStyles;
