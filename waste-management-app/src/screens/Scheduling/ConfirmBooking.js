/**
 * ConfirmBooking Screen
 * Final screen for reviewing and confirming the waste collection booking
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
  StatusBar,
  Modal,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeeDisplay from '../../components/FeeDisplay';
import SchedulingService from '../../api/schedulingService';
import { mockResident, timeSlots, wasteTypes } from '../../api/mockData';
import { DateUtils, formatCurrency } from '../../utils/schedulingHelpers';

/**
 * ConfirmBooking Screen Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.route - Route parameters containing booking details
 */
const ConfirmBookingScreen = ({ navigation, route }) => {
  const {
    selectedBins = [],
    selectedBinIds = [],
    selectedDate = '',
    selectedTimeSlot = '',
    selectedWasteType = '',
    feeData = null,
    estimatedWeight = 0
  } = route.params || {};

  // State management
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  /**
   * Gets time slot display name
   */
  const getTimeSlotDisplay = () => {
    const slot = timeSlots.find(s => s.id === selectedTimeSlot);
    return slot ? slot.label : selectedTimeSlot;
  };

  /**
   * Gets waste type display info
   */
  const getWasteTypeDisplay = () => {
    const wasteType = wasteTypes.find(w => w.id === selectedWasteType);
    return wasteType || { label: selectedWasteType, icon: '🗑️' };
  };

  /**
   * Handles booking confirmation
   */
  const handleConfirmBooking = async () => {
    try {
      setLoading(true);

      // Prepare booking data
      const bookingData = {
        residentId: mockResident.id,
        binIds: selectedBinIds,
        wasteType: selectedWasteType,
        scheduledDate: selectedDate,
        timeSlot: selectedTimeSlot,
        totalFee: feeData.total,
        estimatedWeight: estimatedWeight,
        billingModel: mockResident.billingModel,
        specialInstructions: '', // Could be added as a field
        createdAt: new Date().toISOString()
      };

      // Submit booking
      const result = await SchedulingService.submitBooking(bookingData);
      
      setBookingResult(result.data);
      setShowSuccessModal(true);

    } catch (error) {
      setLoading(false);
      
      // Handle specific error cases
      if (error.code === 'SLOT_UNAVAILABLE') {
        Alert.alert(
          'Booking Unavailable',
          'The selected time slot is no longer available. Please go back and select a different time.',
          [
            { text: 'Go Back', onPress: () => navigation.goBack() },
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else if (error.code === 'VALIDATION_ERROR') {
        Alert.alert(
          'Booking Error',
          `Please check your booking details:\n${error.details?.join('\n') || error.error}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Booking Failed',
          error.error || 'Failed to confirm booking. Please try again.',
          [
            { text: 'Retry', onPress: handleConfirmBooking },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    }
  };

  /**
   * Handles success modal close and navigation
   */
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    
    // Navigate to home or booking history
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }], // Assuming there's a Home screen
    });
  };

  /**
   * Handles edit booking (go back)
   */
  const handleEditBooking = () => {
    Alert.alert(
      'Edit Booking',
      'Which details would you like to change?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Change Bins', onPress: () => navigation.navigate('SchedulePickup') },
        { text: 'Change Date/Time', onPress: () => navigation.goBack() }
      ]
    );
  };

  /**
   * Renders booking summary header
   */
  const renderSummaryHeader = () => (
    <View style={styles.summaryHeader}>
      <Text style={styles.summaryTitle}>Booking Summary</Text>
      <Text style={styles.summarySubtitle}>
        Please review your booking details before confirming
      </Text>
    </View>
  );

  /**
   * Renders collection details
   */
  const renderCollectionDetails = () => {
    const wasteTypeInfo = getWasteTypeDisplay();
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Collection Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>
            {DateUtils.formatDisplayDate(selectedDate)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>
            {getTimeSlotDisplay()}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Waste Type:</Text>
          <View style={styles.wasteTypeInfo}>
            <Text style={styles.wasteTypeIcon}>{wasteTypeInfo.icon}</Text>
            <Text style={styles.detailValue}>{wasteTypeInfo.label}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Estimated Weight:</Text>
          <Text style={styles.detailValue}>{estimatedWeight}kg</Text>
        </View>
      </View>
    );
  };

  /**
   * Renders selected bins details
   */
  const renderBinsDetails = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Selected Bins ({selectedBins.length})</Text>
      
      {selectedBins.map(bin => (
        <View key={bin.id} style={styles.binDetailCard}>
          <View style={styles.binDetailHeader}>
            <Text style={styles.binDetailType}>{bin.type}</Text>
            <Text style={styles.binDetailFillLevel}>{bin.currentFillLevel}% full</Text>
          </View>
          
          <View style={styles.binDetailInfo}>
            <Text style={styles.binDetailLocation}>📍 {bin.location}</Text>
            <Text style={styles.binDetailCapacity}>Capacity: {bin.capacity}L</Text>
            
            {bin.isSmartBin && (
              <View style={styles.smartBinBadge}>
                <Text style={styles.smartBinText}>📱 Smart Bin</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  /**
   * Renders resident information
   */
  const renderResidentInfo = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Collection Address</Text>
      
      <View style={styles.addressCard}>
        <Text style={styles.residentName}>{mockResident.name}</Text>
        <Text style={styles.residentAddress}>{mockResident.address}</Text>
        <Text style={styles.residentPhone}>{mockResident.phone}</Text>
      </View>
    </View>
  );

  /**
   * Renders important notes
   */
  const renderImportantNotes = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Important Notes</Text>
      
      <View style={styles.notesContainer}>
        <View style={styles.noteItem}>
          <Text style={styles.noteIcon}>⏰</Text>
          <Text style={styles.noteText}>
            Please ensure bins are accessible during the selected time window
          </Text>
        </View>
        
        <View style={styles.noteItem}>
          <Text style={styles.noteIcon}>💳</Text>
          <Text style={styles.noteText}>
            Payment will be processed after successful collection
          </Text>
        </View>
        
        <View style={styles.noteItem}>
          <Text style={styles.noteIcon}>📱</Text>
          <Text style={styles.noteText}>
            You will receive SMS and app notifications about your collection
          </Text>
        </View>
        
        <View style={styles.noteItem}>
          <Text style={styles.noteIcon}>🔄</Text>
          <Text style={styles.noteText}>
            You can cancel this booking up to 24 hours before collection
          </Text>
        </View>
      </View>
    </View>
  );

  /**
   * Renders action buttons
   */
  const renderActionButtons = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEditBooking}
        disabled={loading}
      >
        <Text style={styles.editButtonText}>Edit Booking</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.confirmButton, loading && styles.disabledButton]}
        onPress={handleConfirmBooking}
        disabled={loading}
        testID="confirm-booking-button"
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.confirmButtonText}>Confirming...</Text>
          </View>
        ) : (
          <Text style={styles.confirmButtonText}>
            Confirm Booking - {formatCurrency(feeData?.total || 0)}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  /**
   * Renders success modal
   */
  const renderSuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent={true}
      animationType="fade"
      onRequestClose={handleSuccessClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.successModal}>
          <View style={styles.successHeader}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
          </View>
          
          <View style={styles.successContent}>
            <Text style={styles.confirmationNumber}>
              Confirmation Number: {bookingResult?.booking?.confirmationNumber}
            </Text>
            
            <Text style={styles.successMessage}>
              {bookingResult?.message}
            </Text>
            
            <View style={styles.nextStepsContainer}>
              <Text style={styles.nextStepsTitle}>Next Steps:</Text>
              {bookingResult?.nextSteps?.map((step, index) => (
                <Text key={index} style={styles.nextStepItem}>
                  • {step}
                </Text>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.successButton}
            onPress={handleSuccessClose}
          >
            <Text style={styles.successButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Header */}
        {renderSummaryHeader()}

        {/* Collection Details */}
        {renderCollectionDetails()}

        {/* Selected Bins */}
        {renderBinsDetails()}

        {/* Fee Display */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <FeeDisplay
            feeData={feeData}
            showBreakdown={false}
          />
        </View>

        {/* Resident Info */}
        {renderResidentInfo()}

        {/* Important Notes */}
        {renderImportantNotes()}

        {/* Spacer for buttons */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Buttons */}
      {renderActionButtons()}

      {/* Success Modal */}
      {renderSuccessModal()}
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
    width: 60
  },
  content: {
    flex: 1
  },
  summaryHeader: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8
  },
  summarySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center'
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
    marginBottom: 16
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  detailLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600'
  },
  wasteTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  wasteTypeIcon: {
    fontSize: 16,
    marginRight: 6
  },
  binDetailCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  binDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  binDetailType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text
  },
  binDetailFillLevel: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '600'
  },
  binDetailInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  binDetailLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 16,
    marginBottom: 4
  },
  binDetailCapacity: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4
  },
  smartBinBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8
  },
  smartBinText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600'
  },
  addressCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12
  },
  residentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4
  },
  residentAddress: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4
  },
  residentPhone: {
    fontSize: 14,
    color: colors.textSecondary
  },
  notesContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  noteIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2
  },
  noteText: {
    fontSize: 14,
    color: colors.secondary,
    flex: 1,
    lineHeight: 20
  },
  bottomSpacer: {
    height: 120
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    gap: 12
  },
  editButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary
  },
  confirmButton: {
    flex: 2,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  successModal: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 24
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.success
  },
  successContent: {
    marginBottom: 24
  },
  confirmationNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8
  },
  successMessage: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22
  },
  nextStepsContainer: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 8
  },
  nextStepItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 18
  },
  successButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  successButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default ConfirmBookingScreen;
