/**
 * SelectDateTime Screen
 * Date and time selection for waste collection scheduling
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module SelectDateTimeScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * SelectDateTime Screen Component
 */
const SelectDateTimeScreen = ({ navigation, route }) => {
  const { selectedBins } = route.params || {};
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Generate next 7 days
  const dates = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  const timeSlots = [
    { id: '1', label: 'Morning', time: '08:00 AM - 12:00 PM', icon: '🌅' },
    { id: '2', label: 'Afternoon', time: '12:00 PM - 04:00 PM', icon: '☀️' },
    { id: '3', label: 'Evening', time: '04:00 PM - 08:00 PM', icon: '🌆' },
  ];

  const handleNext = () => {
    if (!selectedDate || !selectedTimeSlot) {
      Alert.alert('Incomplete Selection', 'Please select both date and time slot');
      return;
    }

    navigation.navigate('ConfirmBooking', {
      selectedBins,
      selectedDate,
      selectedTimeSlot
    });
  };

  const renderDateCard = (date, index) => {
    const isSelected = selectedDate === index;
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });

    return (
      <TouchableOpacity
        key={index}
        style={[styles.dateCard, isSelected && styles.dateCardSelected]}
        onPress={() => setSelectedDate(index)}
      >
        <Text style={[styles.dayName, isSelected && styles.textSelected]}>{dayName}</Text>
        <Text style={[styles.dayNum, isSelected && styles.textSelected]}>{dayNum}</Text>
        <Text style={[styles.monthName, isSelected && styles.textSelected]}>{monthName}</Text>
      </TouchableOpacity>
    );
  };

  const renderTimeSlot = (slot) => {
    const isSelected = selectedTimeSlot === slot.id;

    return (
      <TouchableOpacity
        key={slot.id}
        style={[styles.timeSlotCard, isSelected && styles.timeSlotCardSelected]}
        onPress={() => setSelectedTimeSlot(slot.id)}
      >
        <Text style={styles.timeSlotIcon}>{slot.icon}</Text>
        <View style={styles.timeSlotInfo}>
          <Text style={[styles.timeSlotLabel, isSelected && styles.textSelected]}>
            {slot.label}
          </Text>
          <Text style={[styles.timeSlotTime, isSelected && styles.textSelected]}>
            {slot.time}
          </Text>
        </View>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
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
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <Text style={styles.progressLabel}>Date & Time</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={styles.progressDot} />
          <Text style={styles.progressLabel}>Confirm</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.datesScroll}
          >
            {dates.map((date, index) => renderDateCard(date, index))}
          </ScrollView>
        </View>

        {/* Time Slot Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Select Time Slot</Text>
          <View style={styles.timeSlotsContainer}>
            {timeSlots.map(slot => renderTimeSlot(slot))}
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Our collection crew will arrive during your selected time slot. Please ensure bins are accessible.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!selectedDate || !selectedTimeSlot) && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!selectedDate || !selectedTimeSlot}
        >
          <Text style={styles.nextButtonText}>Next: Confirm Booking</Text>
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
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  datesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16
  },
  dateCard: {
    width: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  dateCardSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32'
  },
  dayName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  dayNum: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  monthName: {
    fontSize: 12,
    color: '#666'
  },
  textSelected: {
    color: '#2E7D32'
  },
  timeSlotsContainer: {
    gap: 12
  },
  timeSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  timeSlotCardSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32'
  },
  timeSlotIcon: {
    fontSize: 32,
    marginRight: 16
  },
  timeSlotInfo: {
    flex: 1
  },
  timeSlotLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  timeSlotTime: {
    fontSize: 14,
    color: '#666'
  },
  checkmark: {
    fontSize: 24,
    color: '#2E7D32',
    fontWeight: 'bold'
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666'
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF'
  },
  nextButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  nextButtonDisabled: {
    backgroundColor: '#E0E0E0'
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default SelectDateTimeScreen;
