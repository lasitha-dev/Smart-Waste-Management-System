/**
 * Payment Stack Navigator
 * Defines navigation structure for payment module
 * @module PaymentStack
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PaymentHub from '../screens/Payments/PaymentHub';
import PaymentPage from '../screens/Payments/PaymentPage';
import PaymentConfirmation from '../screens/Payments/PaymentConfirmation';
import PaymentHistory from '../screens/Payments/PaymentHistory';
import ReceiptViewScreen from '../screens/Payments/ReceiptViewScreen';
import CheckPoints from '../screens/Payments/CheckPoints';
import ApplyPoints from '../screens/Payments/ApplyPoints';
import ScheduleAutoPay from '../screens/Payments/ScheduleAutoPay';

const Stack = createStackNavigator();

/**
 * PaymentStack Component
 * Navigation stack for all payment-related screens
 */
export default function PaymentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F3F4F6' },
      }}
    >
      <Stack.Screen 
        name="PaymentHub" 
        component={PaymentHub}
        options={{ title: 'Payments' }}
      />
      <Stack.Screen 
        name="PaymentPage" 
        component={PaymentPage}
        options={{ title: 'Payment' }}
      />
      <Stack.Screen 
        name="PaymentConfirmation" 
        component={PaymentConfirmation}
        options={{ title: 'Payment Successful' }}
      />
      <Stack.Screen 
        name="PaymentHistory" 
        component={PaymentHistory}
        options={{ title: 'Payment History' }}
      />
      <Stack.Screen 
        name="ReceiptView" 
        component={ReceiptViewScreen}
        options={{ title: 'Receipt' }}
      />
      <Stack.Screen 
        name="CheckPoints" 
        component={CheckPoints}
        options={{ title: 'My Points' }}
      />
      <Stack.Screen 
        name="ApplyPoints" 
        component={ApplyPoints}
        options={{ title: 'Apply Points' }}
      />
      <Stack.Screen 
        name="ScheduleAutoPay" 
        component={ScheduleAutoPay}
        options={{ title: 'Auto-Pay' }}
      />
    </Stack.Navigator>
  );
}
