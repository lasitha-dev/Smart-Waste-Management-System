/**
 * App Component
 * Root component of the Waste Management Application
 * Includes authentication and role-based access control
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { RouteProvider } from './src/context/RouteContext';
import { BinsProvider } from './src/context/BinsContext';
import { UserProvider } from './src/context/UserContext';

/**
 * App
 * Main application component with navigation and context providers
 * Provider hierarchy:
 * - AuthProvider: Authentication and role management (outermost)
 * - UserProvider: User profile and preferences
 * - BinsProvider: Bin management state
 * - RouteProvider: Route management state
 * 
 * @returns {JSX.Element} The root App component
 */
export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <BinsProvider>
          <RouteProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </RouteProvider>
        </BinsProvider>
      </UserProvider>
    </AuthProvider>
  );
}
