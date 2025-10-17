/**
 * AppNavigator
 * Main navigation stack for the application
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/BinCollection/DashboardScreen';
import RouteManagementScreen from '../screens/BinCollection/RouteManagementScreen';
import ScanBinScreen from '../screens/BinCollection/ScanBinScreen';
import ReportsScreen from '../screens/BinCollection/ReportsScreen';
import { COLORS, FONTS } from '../constants/theme';

const Stack = createNativeStackNavigator();

/**
 * AppNavigator
 * Defines the navigation stack with all app screens
 * @returns {JSX.Element} The navigation stack
 */
const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primaryDarkTeal,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: FONTS.weight.bold,
          fontSize: FONTS.size.subheading,
        },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RouteManagement"
        component={RouteManagementScreen}
        options={{
          title: 'Route Management',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ScanBin"
        component={ScanBinScreen}
        options={{
          title: 'Scan Bin',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Reports',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
