/**
 * App Component
 * Root component of the Waste Management Application
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { RouteProvider } from './src/context/RouteContext';

/**
 * App
 * Main application component with navigation and context providers
 * @returns {JSX.Element} The root App component
 */
export default function App() {
  return (
    <RouteProvider>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </RouteProvider>
  );
}
