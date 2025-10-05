/**
 * DateTimePicker Component
 * Custom date and time picker component for waste collection scheduling
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module DateTimePicker
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { DateUtils } from '../utils/schedulingHelpers';
import { timeSlots } from '../api/mockData';

const { width, height } = Dimensions.get('window');

/**
 * DateTimePicker component for selecting date and time
 * @param {Object} props - Component props
 * @param {string} props.selectedDate - Currently selected date (YYYY-MM-DD)
 * @param {string} props.selectedTimeSlot - Currently selected time slot ID
 * @param {Function} props.onDateChange - Callback when date changes
 * @param {Function} props.onTimeSlotChange - Callback when time slot changes
 * @param {boolean} props.disabled - Whether the picker is disabled
 * @param {string} props.style - Additional styles
 */
const DateTimePicker = ({
  selectedDate,
  selectedTimeSlot,
  onDateChange,
  onTimeSlotChange,
  disabled = false,
  style
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadAvailableDates();
  }, [currentMonth]);

  const loadAvailableDates = () => {
    const dates = DateUtils.getAvailableDates();
    setAvailableDates(dates);
  };

  const handleDateSelect = (date) => {
    const validation = DateUtils.validateScheduleDate(date);
    if (!validation.isValid) {
      Alert.alert('Invalid Date', validation.reason);
      return;
    }

    if (onDateChange) {
      onDateChange(date);
    }
    setShowDatePicker(false);
  };

  const handleTimeSlotSelect = (timeSlotId) => {
    if (onTimeSlotChange) {
      onTimeSlotChange(timeSlotId);
    }
    setShowTimePicker(false);
  };

  const getSelectedDateDisplay = () => {
    if (!selectedDate) return 'Select Date';
    return DateUtils.formatDisplayDate(selectedDate);
  };

  const getSelectedTimeSlotDisplay = () => {
    if (!selectedTimeSlot) return 'Select Time';
    const slot = timeSlots.find(s => s.id === selectedTimeSlot);
    return slot ? slot.label : 'Select Time';
  };

  const renderCalendar = () => {
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Generate calendar days
    const calendarDays = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = DateUtils.formatDate(date);
      const isAvailable = availableDates.some(d => d.date === dateString);
      const isSelected = selectedDate === dateString;
      const isPast = date < today;
      
      calendarDays.push({
        day,
        date: dateString,
        isAvailable,
        isSelected,
        isPast
      });
    }

    return (
      <View style={styles.calendar}>
        {/* Month/Year Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() - 1);
              setCurrentMonth(newMonth);
            }}
          >
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.monthYearText}>
            {currentMonth.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </Text>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(newMonth.getMonth() + 1);
              setCurrentMonth(newMonth);
            }}
          >
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day Labels */}
        <View style={styles.dayLabels}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.dayLabel}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((dayData, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarDay,
                dayData?.isSelected && styles.selectedDay,
                dayData?.isPast && styles.pastDay,
                !dayData?.isAvailable && dayData && styles.unavailableDay
              ]}
              onPress={() => {
                if (dayData && dayData.isAvailable && !dayData.isPast) {
                  handleDateSelect(dayData.date);
                }
              }}
              disabled={!dayData || !dayData.isAvailable || dayData.isPast}
            >
              <Text style={[
                styles.calendarDayText,
                dayData?.isSelected && styles.selectedDayText,
                dayData?.isPast && styles.pastDayText,
                !dayData?.isAvailable && dayData && styles.unavailableDayText
              ]}>
                {dayData?.day || ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.disabled }]} />
            <Text style={styles.legendText}>Unavailable</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTimeSlots = () => {
    return (
      <View style={styles.timeSlots}>
        <Text style={styles.timeSlotsTitle}>Select Time Slot</Text>
        {timeSlots.map(slot => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.timeSlot,
              selectedTimeSlot === slot.id && styles.selectedTimeSlot,
              !slot.available && styles.unavailableTimeSlot
            ]}
            onPress={() => handleTimeSlotSelect(slot.id)}
            disabled={!slot.available}
          >
            <Text style={[
              styles.timeSlotText,
              selectedTimeSlot === slot.id && styles.selectedTimeSlotText,
              !slot.available && styles.unavailableTimeSlotText
            ]}>
              {slot.label}
            </Text>
            
            {!slot.available && (
              <Text style={styles.unavailableLabel}>Unavailable</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Date Selector */}
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Collection Date</Text>
        <TouchableOpacity
          style={[
            styles.selector,
            disabled && styles.disabledSelector,
            selectedDate && styles.selectedSelector
          ]}
          onPress={() => !disabled && setShowDatePicker(true)}
          disabled={disabled}
          testID="date-selector"
        >
          <Text style={[
            styles.selectorText,
            disabled && styles.disabledSelectorText,
            selectedDate && styles.selectedSelectorText
          ]}>
            📅 {getSelectedDateDisplay()}
          </Text>
          <Text style={styles.selectorArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Time Slot Selector */}
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Time Slot</Text>
        <TouchableOpacity
          style={[
            styles.selector,
            disabled && styles.disabledSelector,
            selectedTimeSlot && styles.selectedSelector
          ]}
          onPress={() => !disabled && setShowTimePicker(true)}
          disabled={disabled}
          testID="time-selector"
        >
          <Text style={[
            styles.selectorText,
            disabled && styles.disabledSelectorText,
            selectedTimeSlot && styles.selectedSelectorText
          ]}>
            🕐 {getSelectedTimeSlotDisplay()}
          </Text>
          <Text style={styles.selectorArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Collection Date</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {renderCalendar()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time Slot</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {renderTimeSlots()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const colors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  disabled: '#9E9E9E',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0'
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8
  },
  selectorContainer: {
    marginBottom: 16
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    minHeight: 56
  },
  selectedSelector: {
    borderColor: colors.primary,
    backgroundColor: '#E8F5E8'
  },
  disabledSelector: {
    backgroundColor: colors.surface,
    borderColor: colors.disabled
  },
  selectorText: {
    fontSize: 16,
    color: colors.textSecondary,
    flex: 1
  },
  selectedSelectorText: {
    color: colors.text,
    fontWeight: '600'
  },
  disabledSelectorText: {
    color: colors.disabled
  },
  selectorArrow: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    width: width * 0.9,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.textSecondary
  },
  modalBody: {
    padding: 20
  },
  calendar: {
    marginBottom: 20
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  navButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold'
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text
  },
  dayLabels: {
    flexDirection: 'row',
    marginBottom: 10
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  calendarDay: {
    width: `${100/7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4
  },
  selectedDay: {
    backgroundColor: colors.success
  },
  pastDay: {
    backgroundColor: colors.surface
  },
  unavailableDay: {
    backgroundColor: colors.disabled
  },
  calendarDayText: {
    fontSize: 16,
    color: colors.text
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold'
  },
  pastDayText: {
    color: colors.disabled
  },
  unavailableDayText: {
    color: 'white'
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary
  },
  timeSlots: {
    marginBottom: 20
  },
  timeSlotsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center'
  },
  timeSlot: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  selectedTimeSlot: {
    borderColor: colors.primary,
    backgroundColor: '#E8F5E8'
  },
  unavailableTimeSlot: {
    backgroundColor: colors.surface,
    borderColor: colors.disabled
  },
  timeSlotText: {
    fontSize: 16,
    color: colors.text,
    flex: 1
  },
  selectedTimeSlotText: {
    fontWeight: 'bold',
    color: colors.primary
  },
  unavailableTimeSlotText: {
    color: colors.disabled
  },
  unavailableLabel: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600'
  }
});

export default DateTimePicker;
