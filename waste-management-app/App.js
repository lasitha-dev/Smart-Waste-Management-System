/**
 * Smart Waste Management System - Main App Entry Point
 * A comprehensive waste collection scheduling and management application
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @version 1.0.0
 * @module App
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src/components/Toast';
import ErrorBoundary from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Main App Component
 * Wraps the entire application with necessary providers and error boundaries
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary fallbackComponent="AppCrashed" showReloadButton={true}>
        <ToastProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </ToastProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
