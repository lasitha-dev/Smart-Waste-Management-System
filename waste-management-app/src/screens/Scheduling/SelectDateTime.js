/**
 * SelectDateTime Screen
 * Screen for selecting collection date, time slot, waste type, and viewing fee calculation
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module SelectDateTimeScreen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '../../components/DateTimePicker';
import FeeDisplay from '../../components/FeeDisplay';
import SchedulingService from '../../api/schedulingService';
import { wasteTypes, mockResident } from '../../api/mockData';
import { estimateBinWeight } from '../../utils/schedulingHelpers';

/**
 * SelectDateTime Screen Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.route - Route parameters containing selectedBins and selectedBinIds
 */
const SelectDateTimeScreen = ({ navigation, route }) => {
  const { selectedBins = [], selectedBinIds = [] } = route.params || {};

  // State management
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedWasteType, setSelectedWasteType] = useState('');
  const [feeData, setFeeData] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState(null);
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);

  useEffect(() => {
    // Auto-select waste type based on most common bin type
    if (selectedBins.length > 0) {
      const binTypes = selectedBins.map(bin => bin.type);
      const mostCommonType = getMostCommonBinType(binTypes);
      const defaultWasteType = getWasteTypeFromBinType(mostCommonType);
      setSelectedWasteType(defaultWasteType);
    }
  }, [selectedBins]);

  useEffect(() => {
    // Calculate fee when all required data is available
    if (selectedWasteType && selectedBinIds.length > 0) {
      calculateFee();
    }
  }, [selectedWasteType, selectedBinIds]);

  useEffect(() => {
    // Check availability when date and time are selected
    if (selectedDate && selectedTimeSlot) {
      checkAvailability();
    }
  }, [selectedDate, selectedTimeSlot]);

  /**
   * Gets the most common bin type from selected bins
   */
  const getMostCommonBinType = (binTypes) => {
    const frequency = {};
    binTypes.forEach(type => {
      frequency[type] = (frequency[type] || 0) + 1;
    });
    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
  };

  /**
   * Maps bin type to waste type
   */
  const getWasteTypeFromBinType = (binType) => {
    const mapping = {
      'General Waste': 'regular',
      'Recyclable': 'recyclable',
      'Organic': 'organic',
      'Bulky Items': 'bulky'
    };
    return mapping[binType] || 'regular';
  };

  /**
   * Calculates estimated weight from selected bins
   */
  const getEstimatedWeight = () => {
    return selectedBins.reduce((total, bin) => {
      return total + estimateBinWeight(bin);
    }, 0);
  };

  /**
   * Calculates collection fee
   */
  const calculateFee = async () => {
    try {
      setFeeLoading(true);
      setFeeError(null);

      const estimatedWeight = getEstimatedWeight();
      
      const result = await SchedulingService.calculateFee({
        wasteType: selectedWasteType,
        binIds: selectedBinIds,
        billingModel: mockResident.billingModel,
        estimatedWeight: estimatedWeight
      });

      setFeeData(result.data);
    } catch (error) {
      setFeeError(error.error || 'Failed to calculate fee');
      setFeeData(null);
    } finally {
      setFeeLoading(false);
    }
  };

  /**
   * Checks slot availability
   */
  const checkAvailability = async () => {
    try {
      setAvailabilityChecking(true);
      setAvailabilityError(null);

      await SchedulingService.checkAvailability(selectedDate, selectedTimeSlot);
      
      // If we get here, the slot is available
      setAvailabilityError(null);
    } catch (error) {
      setAvailabilityError(error.error || 'Slot unavailable');
      
      // Handle specific unavailability with alternatives
      if (error.code === 'SLOT_UNAVAILABLE' && error.alternatives) {
        showAlternativesAlert(error.alternatives);
      }
    } finally {
      setAvailabilityChecking(false);
    }
  };

  /**
   * Shows alternatives when slot is unavailable
   */
  const showAlternativesAlert = (alternatives) => {
    const alternativeSlots = alternatives.sameDay || [];
    const nextDate = alternatives.nextAvailableDate;

    let message = 'The selected time slot is not available.\n\n';
    
    if (alternativeSlots.length > 0) {
      message += 'Available slots for the same day:\n';
      alternativeSlots.forEach(slot => {
        message += `• ${slot.label}\n`;
      });
    }
    
    if (nextDate) {
      message += `\nNext available date: ${nextDate}`;
    }

    Alert.alert(
      'Time Slot Unavailable',
      message,
      [
        { text: 'OK', style: 'default' },
        alternativeSlots.length > 0 && {
          text: 'Select Alternative',
          onPress: () => setSelectedTimeSlot(alternativeSlots[0].id)
        }
      ].filter(Boolean)
    );
  };

  /**
   * Handles waste type selection
   */
  const handleWasteTypeSelect = (wasteTypeId) => {
    setSelectedWasteType(wasteTypeId);
  };

  /**
   * Handles continue to confirmation
   */
  const handleContinue = () => {
    // Validation
    if (!selectedDate) {
      Alert.alert('Missing Information', 'Please select a collection date.');
      return;
    }

    if (!selectedTimeSlot) {
      Alert.alert('Missing Information', 'Please select a time slot.');
      return;
    }

    if (!selectedWasteType) {
      Alert.alert('Missing Information', 'Please select a waste type.');
      return;
    }

    if (availabilityError) {
      Alert.alert('Slot Unavailable', 'Please select an available time slot.');
      return;
    }

    if (!feeData) {
      Alert.alert('Fee Calculation', 'Please wait for fee calculation to complete.');
      return;
    }

    // Navigate to confirmation screen
    navigation.navigate('ConfirmBooking', {
      selectedBins,
      selectedBinIds,
      selectedDate,
      selectedTimeSlot,
      selectedWasteType,
      feeData,
      estimatedWeight: getEstimatedWeight()
    });
  };

  /**
   * Handles back navigation
   */
  const handleBack = () => {
    navigation.goBack();
  };

  /**
   * Renders selected bins summary
   */
  const renderBinsSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Selected Bins ({selectedBins.length})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {selectedBins.map(bin => (
          <View key={bin.id} style={styles.binSummaryCard}>
            <Text style={styles.binType}>{bin.type}</Text>
            <Text style={styles.binLocation}>{bin.location}</Text>
            <Text style={styles.binFillLevel}>{bin.currentFillLevel}% full</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  /**
   * Renders waste type selector
   */
  const renderWasteTypeSelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Waste Type</Text>
      <Text style={styles.sectionSubtitle}>Select the primary type of waste for collection</Text>
      
      <View style={styles.wasteTypeGrid}>
        {wasteTypes.map(wasteType => (
          <TouchableOpacity
            key={wasteType.id}
            style={[
              styles.wasteTypeCard,
              selectedWasteType === wasteType.id && styles.selectedWasteTypeCard
            ]}
            onPress={() => handleWasteTypeSelect(wasteType.id)}
            testID={`waste-type-${wasteType.id}`}
          >
            <Text style={styles.wasteTypeIcon}>{wasteType.icon}</Text>
            <Text style={[
              styles.wasteTypeLabel,
              selectedWasteType === wasteType.id && styles.selectedWasteTypeLabel
            ]}>
              {wasteType.label}
            </Text>
            <Text style={styles.wasteTypeDescription}>
              {wasteType.description}
            </Text>
            <Text style={styles.wasteTypeFee}>
              Base: LKR {wasteType.baseFee}
            </Text>
            
            {selectedWasteType === wasteType.id && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedIndicatorText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  /**
   * Renders availability status
   */
  const renderAvailabilityStatus = () => {
    if (!selectedDate || !selectedTimeSlot) return null;

    return (
      <View style={styles.availabilityContainer}>
        {availabilityChecking ? (
          <View style={styles.availabilityChecking}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.availabilityText}>Checking availability...</Text>
          </View>
        ) : availabilityError ? (
          <View style={styles.availabilityError}>
            <Text style={styles.availabilityErrorIcon}>⚠️</Text>
            <Text style={styles.availabilityErrorText}>{availabilityError}</Text>
          </View>
        ) : (
          <View style={styles.availabilitySuccess}>
            <Text style={styles.availabilitySuccessIcon}>✅</Text>
            <Text style={styles.availabilitySuccessText}>Time slot is available</Text>
          </View>
        )}
      </View>
    );
  };

  /**
   * Renders continue button
   */
  const renderContinueButton = () => {
    const canContinue = selectedDate && 
                       selectedTimeSlot && 
                       selectedWasteType && 
                       !availabilityError && 
                       !availabilityChecking && 
                       feeData && 
                       !feeLoading;

    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !canContinue && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
          testID="continue-button"
        >
          <Text style={[
            styles.continueButtonText,
            !canContinue && styles.disabledButtonText
          ]}>
            {feeLoading ? 'Calculating...' : 'Continue to Confirmation'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Selected Bins Summary */}
        {renderBinsSummary()}

        {/* Waste Type Selection */}
        {renderWasteTypeSelector()}

        {/* Date Time Picker */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Collection Schedule</Text>
          <DateTimePicker
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            onDateChange={setSelectedDate}
            onTimeSlotChange={setSelectedTimeSlot}
          />
          
          {/* Availability Status */}
          {renderAvailabilityStatus()}
        </View>

        {/* Fee Display */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Collection Fee</Text>
          <FeeDisplay
            feeData={feeData}
            loading={feeLoading}
            error={feeError}
            showBreakdown={true}
          />
        </View>

        {/* Spacer for button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Continue Button */}
      {renderContinueButton()}
    </SafeAreaView>
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
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background
  },
  backButton: {
    padding: 8
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'center'
  },
  headerSpacer: {
    width: 60 // Balance the back button
  },
  content: {
    flex: 1
  },
  summaryContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12
  },
  binSummaryCard: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center'
  },
  binType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center'
  },
  binLocation: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2
  },
  binFillLevel: {
    fontSize: 10,
    color: colors.warning,
    marginTop: 2,
    fontWeight: '600'
  },
  sectionContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16
  },
  wasteTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  wasteTypeCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative'
  },
  selectedWasteTypeCard: {
    borderColor: colors.primary,
    backgroundColor: '#E8F5E8'
  },
  wasteTypeIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  wasteTypeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4
  },
  selectedWasteTypeLabel: {
    color: colors.primary
  },
  wasteTypeDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 14
  },
  wasteTypeFee: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: '600'
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  availabilityContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8
  },
  availabilityChecking: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8
  },
  availabilityText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.warning
  },
  availabilityError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error
  },
  availabilityErrorIcon: {
    fontSize: 16,
    marginRight: 8
  },
  availabilityErrorText: {
    fontSize: 14,
    color: colors.error,
    flex: 1
  },
  availabilitySuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.success
  },
  availabilitySuccessIcon: {
    fontSize: 16,
    marginRight: 8
  },
  availabilitySuccessText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600'
  },
  bottomSpacer: {
    height: 100 // Space for fixed button
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  disabledButton: {
    backgroundColor: colors.disabled
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  disabledButtonText: {
    color: '#FFFFFF'
  }
});

export default SelectDateTimeScreen;
