/**
 * ConfirmBooking Screen
 * Final confirmation screen before booking waste collection
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module ConfirmBookingScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * ConfirmBooking Screen Component
 */
const ConfirmBookingScreen = ({ navigation, route }) => {
  const { selectedBins, selectedDate, selectedTimeSlot } = route.params || {};
  const [isBooking, setIsBooking] = useState(false);

  const bins = [
    { id: '1', type: 'General Waste', location: 'Kitchen', icon: '🗑️' },
    { id: '2', type: 'Recyclable', location: 'Garage', icon: '♻️' },
    { id: '3', type: 'Organic Waste', location: 'Backyard', icon: '🍂' },
  ];

  const timeSlots = [
    { id: '1', label: 'Morning', time: '08:00 AM - 12:00 PM' },
    { id: '2', label: 'Afternoon', time: '12:00 PM - 04:00 PM' },
    { id: '3', label: 'Evening', time: '04:00 PM - 08:00 PM' },
  ];

  const dates = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  const selectedBinData = bins.filter(bin => selectedBins?.includes(bin.id));
  const selectedTimeSlotData = timeSlots.find(slot => slot.id === selectedTimeSlot);
  const selectedDateData = dates[selectedDate];

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsBooking(false);
      Alert.alert(
        'Booking Confirmed! 🎉',
        'Your waste collection has been scheduled successfully.',
        [
          {
            text: 'View History',
            onPress: () => navigation.navigate('History')
          },
          {
            text: 'Done',
            onPress: () => navigation.navigate('AdminHome')
          }
        ]
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, styles.progressDotCompleted]}>
            <Text style={styles.completedMark}>✓</Text>
          </View>
          <Text style={styles.progressLabel}>Select Bins</Text>
        </View>
        <View style={[styles.progressLine, styles.progressLineCompleted]} />
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, styles.progressDotCompleted]}>
            <Text style={styles.completedMark}>✓</Text>
          </View>
          <Text style={styles.progressLabel}>Date & Time</Text>
        </View>
        <View style={[styles.progressLine, styles.progressLineCompleted]} />
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <Text style={styles.progressLabel}>Confirm</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📋 Booking Summary</Text>
          
          {/* Date & Time */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>📅 Collection Date</Text>
            <Text style={styles.summaryValue}>
              {selectedDateData?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>🕐 Time Slot</Text>
            <Text style={styles.summaryValue}>
              {selectedTimeSlotData?.label} ({selectedTimeSlotData?.time})
            </Text>
          </View>

          {/* Selected Bins */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>🗑️ Selected Bins ({selectedBinData.length})</Text>
            {selectedBinData.map(bin => (
              <View key={bin.id} style={styles.binItem}>
                <Text style={styles.binItemIcon}>{bin.icon}</Text>
                <View style={styles.binItemInfo}>
                  <Text style={styles.binItemType}>{bin.type}</Text>
                  <Text style={styles.binItemLocation}>📍 {bin.location}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Fee */}
          <View style={styles.feeSection}>
            <Text style={styles.feeLabel}>Service Fee</Text>
            <Text style={styles.feeValue}>$10.00</Text>
          </View>
        </View>

        {/* Important Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>📌 Important Notes</Text>
          <View style={styles.notesList}>
            <Text style={styles.noteItem}>• Ensure bins are accessible at the scheduled time</Text>
            <Text style={styles.noteItem}>• Place bins at the designated collection point</Text>
            <Text style={styles.noteItem}>• You'll receive a notification when crew is on the way</Text>
            <Text style={styles.noteItem}>• Payment will be processed after collection</Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By confirming this booking, you agree to our terms of service and collection policies.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isBooking && styles.confirmButtonDisabled]}
          onPress={handleConfirmBooking}
          disabled={isBooking}
        >
          {isBooking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm & Book</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  backButton: {
    padding: 8
  },
  backIcon: {
    fontSize: 24,
    color: '#2E7D32'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  placeholder: {
    width: 40
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5'
  },
  progressStep: {
    alignItems: 'center'
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressDotActive: {
    backgroundColor: '#2E7D32'
  },
  progressDotCompleted: {
    backgroundColor: '#4CAF50'
  },
  completedMark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
    marginBottom: 24
  },
  progressLineCompleted: {
    backgroundColor: '#4CAF50'
  },
  progressLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    maxWidth: 60
  },
  content: {
    flex: 1,
    padding: 16
  },
  summaryCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20
  },
  summarySection: {
    marginBottom: 20
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8
  },
  summaryValue: {
    fontSize: 16,
    color: '#333'
  },
  binItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8
  },
  binItemIcon: {
    fontSize: 24,
    marginRight: 12
  },
  binItemInfo: {
    flex: 1
  },
  binItemType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2
  },
  binItemLocation: {
    fontSize: 12,
    color: '#666'
  },
  feeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  feeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  feeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32'
  },
  notesCard: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 12
  },
  notesList: {
    gap: 8
  },
  noteItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  termsSection: {
    padding: 16,
    alignItems: 'center'
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center'
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF'
  },
  confirmButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  confirmButtonDisabled: {
    backgroundColor: '#81C784'
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default ConfirmBookingScreen;
