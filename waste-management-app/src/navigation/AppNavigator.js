/**
 * Main App Navigator
 * Root navigation configuration for the Smart Waste Management System
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module AppNavigator
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text, View, StyleSheet } from 'react-native';
import { COLORS, FONTS, STYLES } from '../constants/theme';

// Import navigators
import SchedulingNavigator from './SchedulingNavigator';

// Import other screens (mock implementations for demo)
import HomeScreen from '../screens/HomeScreen';
import BookingHistoryScreen from '../screens/BookingHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Tab Navigator for main app sections
 */
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.modalBackground,
          borderTopWidth: 1,
          borderTopColor: COLORS.textSecondary,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarActiveTintColor: COLORS.accentGreen,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: FONTS.size.small - 2,
          fontWeight: FONTS.weight.semiBold,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color, fontSize: size }]}>🏠</Text>
          ),
        }}
      />
      
      <Tab.Screen
        name="Schedule"
        component={SchedulingNavigator}
        options={{
          tabBarLabel: 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color, fontSize: size }]}>📅</Text>
          ),
        }}
      />
      
      <Tab.Screen
        name="History"
        component={BookingHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color, fontSize: size }]}>📋</Text>
          ),
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color, fontSize: size }]}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Root Stack Navigator
 * Handles modal screens and main navigation
 */
const RootStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'card',
      }}
    >
      {/* Main app with tabs */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          gestureEnabled: false,
        }}
      />
      
      {/* Modal screens that can be opened from anywhere */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="FeedbackModal"
          component={SchedulingNavigator}
          options={{
            title: 'Provide Feedback',
            gestureEnabled: true,
          }}
          initialParams={{ screen: 'ProvideFeedback' }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

/**
 * Main App Navigator Component
 * Wraps the navigation in NavigationContainer
 */
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStackNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    textAlign: 'center',
  }
});

export default AppNavigator;
