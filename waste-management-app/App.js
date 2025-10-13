/**
 * App Component
 * Root component of the Waste Management Application
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * App
 * Main application component with navigation setup
 * @returns {JSX.Element} The root App component
 */
export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
