/**
 * Navigation Index
 * Central export for all navigation components
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module NavigationIndex
 */

// Main App Navigator
export { default as AppNavigator } from './AppNavigator';
export { NavigationHelpers } from './NavigationHelpers';

// Stack Navigators
export { default as SchedulingNavigator } from './SchedulingNavigator';

// Navigation Types (for TypeScript support)
export type { SchedulingStackParamList } from './SchedulingNavigator';
