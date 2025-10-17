/**
 * AppNavigator - Dual Role Navigation System
 * Handles navigation for both Admin (Scheduling) and Crew (Bin Collection) roles
 * 
 * Architecture:
 * - AuthStack: Login and authentication
 * - AdminStack: Scheduling, booking history, feedback (for admins/residents)
 * - CrewStack: Bin collection, routes, analytics (for collection crews)
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform, ActivityIndicator, View } from 'react-native';
import { useAuth, USER_ROLES } from '../context/AuthContext';
import { COLORS, FONTS } from '../constants/theme';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';

// Crew Screens (Bin Collection)
import DashboardScreen from '../screens/BinCollection/DashboardScreen';
import RouteManagementScreen from '../screens/BinCollection/RouteManagementScreen';
import ScanBinScreen from '../screens/BinCollection/ScanBinScreen';
import CrewReportsScreen from '../screens/BinCollection/ReportsScreen';
import CrewProfileScreen from '../screens/BinCollection/ProfileScreen';

// Analytics Screens (Accessible by Crew)
import AnalyticsDashboard from '../screens/Analytics/AnalyticsDashboard';
import AnalyticsReportsScreen from '../screens/Analytics/ReportsScreen';
import KPIsScreen from '../screens/Analytics/KPIsScreen';
import DataCollectionScreen from '../screens/DataCollectionScreen';
import DataProcessingScreen from '../screens/DataProcessingScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import PerformanceMetricsScreen from '../screens/PerformanceMetricsScreen';
import AnalyticsReportScreen from '../screens/ReportsScreen';

// Admin Screens (Scheduling)
import AdminHomeScreen from '../screens/Scheduling/HomeScreen';
import SchedulePickupScreen from '../screens/Scheduling/SchedulePickup';
import SelectDateTimeScreen from '../screens/Scheduling/SelectDateTime';
import ConfirmBookingScreen from '../screens/Scheduling/ConfirmBooking';
import ProvideFeedbackScreen from '../screens/Scheduling/ProvideFeedback';
import BookingHistoryScreen from '../screens/BookingHistoryScreen';
import AdminProfileScreen from '../screens/Admin/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Loading Screen Component
 */
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
    <ActivityIndicator size="large" color={COLORS.accentGreen || '#4CAF50'} />
    <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading...</Text>
  </View>
);

/**
 * AUTH STACK
 * Shown when user is not authenticated
 */
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

/**
 * CREW BOTTOM TABS
 * Main navigation for crew members (bin collection)
 */
const CrewTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarActiveTintColor: '#006B5E',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="CrewDashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Routes"
        component={RouteManagementScreen}
        options={{
          tabBarLabel: 'Routes',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🗺️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="CrewReports"
        component={CrewReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="CrewProfile"
        component={CrewProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * CREW STACK
 * Complete navigation stack for crew members
 */
const CrewStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main tabs */}
      <Stack.Screen name="CrewTabs" component={CrewTabs} />
      
      {/* Additional crew screens */}
      <Stack.Screen name="ScanBin" component={ScanBinScreen} />
      <Stack.Screen name="RouteManagement" component={RouteManagementScreen} />
      
      {/* Analytics screens (accessible from crew dashboard) */}
      <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboard} />
      <Stack.Screen name="AnalyticsReports" component={AnalyticsReportsScreen} />
      <Stack.Screen name="KPIs" component={KPIsScreen} />
      <Stack.Screen name="DataCollection" component={DataCollectionScreen} />
      <Stack.Screen name="DataProcessing" component={DataProcessingScreen} />
      <Stack.Screen name="Analysis" component={AnalysisScreen} />
      <Stack.Screen name="PerformanceMetrics" component={PerformanceMetricsScreen} />
      <Stack.Screen name="AnalyticsReport" component={AnalyticsReportScreen} />
    </Stack.Navigator>
  );
};

/**
 * ADMIN BOTTOM TABS
 * Main navigation for admin/resident users (scheduling)
 */
const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={SchedulePickupScreen}
        options={{
          tabBarLabel: 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📅</Text>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={BookingHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * ADMIN STACK
 * Complete navigation stack for admin/resident users
 */
const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main tabs */}
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      
      {/* Additional admin screens */}
      <Stack.Screen name="SelectDateTime" component={SelectDateTimeScreen} />
      <Stack.Screen name="ConfirmBooking" component={ConfirmBookingScreen} />
      <Stack.Screen name="ProvideFeedback" component={ProvideFeedbackScreen} />
    </Stack.Navigator>
  );
};

/**
 * ROOT NAVIGATOR
 * Conditionally renders based on authentication state and user role
 */
const RootNavigator = () => {
  const { isAuthenticated, isLoading, user, USER_ROLES } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // Authenticated - show appropriate stack based on role
  if (user?.role === USER_ROLES.ADMIN) {
    return <AdminStack />;
  } else if (user?.role === USER_ROLES.CREW) {
    return <CrewStack />;
  }

  // Fallback (shouldn't reach here)
  return <AuthStack />;
};

/**
 * MAIN APP NAVIGATOR
 * Wraps everything in NavigationContainer
 */
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
