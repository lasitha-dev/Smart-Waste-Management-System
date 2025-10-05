/**
 * Scheduling Navigation Stack
 * Navigation configuration for the waste collection scheduling flow
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module SchedulingNavigator
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';

// Import screens
import SchedulePickupScreen from '../screens/Scheduling/SchedulePickup';
import SelectDateTimeScreen from '../screens/Scheduling/SelectDateTime';
import ConfirmBookingScreen from '../screens/Scheduling/ConfirmBooking';
import ProvideFeedbackScreen from '../screens/Scheduling/ProvideFeedback';

const Stack = createStackNavigator();

/**
 * Scheduling Stack Navigator
 * Defines the navigation flow for waste collection scheduling
 */
const SchedulingNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SchedulePickup"
      screenOptions={{
        headerShown: false, // We're using custom headers in each screen
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
        ...Platform.select({
          ios: {
            presentation: 'card',
          },
          android: {
            animationEnabled: true,
          },
        }),
      }}
    >
      {/* Step 1: Bin Selection */}
      <Stack.Screen
        name="SchedulePickup"
        component={SchedulePickupScreen}
        options={{
          title: 'Schedule Pickup',
          gestureEnabled: false, // Prevent going back from first screen
        }}
      />

      {/* Step 2: Date, Time & Waste Type Selection */}
      <Stack.Screen
        name="SelectDateTime"
        component={SelectDateTimeScreen}
        options={{
          title: 'Select Date & Time',
          gestureEnabled: true,
        }}
      />

      {/* Step 3: Booking Confirmation */}
      <Stack.Screen
        name="ConfirmBooking"
        component={ConfirmBookingScreen}
        options={{
          title: 'Confirm Booking',
          gestureEnabled: true,
        }}
      />

      {/* Step 4: Feedback (Post-Collection) */}
      <Stack.Screen
        name="ProvideFeedback"
        component={ProvideFeedbackScreen}
        options={{
          title: 'Provide Feedback',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Navigation parameter types for TypeScript support
 * Define the parameters each screen expects
 */
export type SchedulingStackParamList = {
  SchedulePickup: undefined;
  SelectDateTime: {
    selectedBins: Array<{
      id: string;
      type: string;
      capacity: number;
      status: string;
      location: string;
      isSmartBin: boolean;
      currentFillLevel: number;
      lastEmptied: string;
      sensorEnabled: boolean;
      autoPickupThreshold: number | null;
    }>;
    selectedBinIds: string[];
  };
  ConfirmBooking: {
    selectedBins: Array<object>;
    selectedBinIds: string[];
    selectedDate: string;
    selectedTimeSlot: string;
    selectedWasteType: string;
    feeData: {
      baseFee: number;
      binFee: number;
      weightFee: number;
      wasteTypeFee: number;
      subtotal: number;
      tax: number;
      total: number;
      model: string;
      wasteType: object;
      binCount: number;
      estimatedWeight: number;
      currency: string;
    };
    estimatedWeight: number;
  };
  ProvideFeedback: {
    bookingId: string;
    bookingInfo?: {
      id: string;
      scheduledDate: string;
      timeSlot: string;
      wasteType: string;
      binIds: string[];
      totalFee: number;
      status: string;
    };
  };
};

export default SchedulingNavigator;
