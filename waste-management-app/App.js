/**
 * Smart Waste Management System - Main App
 * Payment & Rewards Management Module
 * Developer: Gabilan S (IT22060426)
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaymentProvider } from './src/context/PaymentContext';
import PaymentStack from './src/navigation/PaymentStack';

export default function App() {
  return (
    <PaymentProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <PaymentStack />
      </NavigationContainer>
    </PaymentProvider>
  );
}
