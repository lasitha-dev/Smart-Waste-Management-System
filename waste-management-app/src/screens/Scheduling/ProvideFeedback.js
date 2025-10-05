/**
 * ProvideFeedback Screen
 * Screen for collecting user feedback after waste collection completion
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module ProvideFeedbackScreen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  StatusBar,
  Modal,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeedbackForm from '../../components/FeedbackForm';
import SchedulingService from '../../api/schedulingService';
import { DateUtils } from '../../utils/schedulingHelpers';
import { timeSlots, wasteTypes } from '../../api/mockData';

/**
 * ProvideFeedback Screen Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.route - Route parameters containing booking information
 */
const ProvideFeedbackScreen = ({ navigation, route }) => {
  const { bookingId, bookingInfo } = route.params || {};

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState(null);

  useEffect(() => {
    // Validate that we have the required booking information
    if (!bookingId) {
      Alert.alert(
        'Missing Information',
        'Booking information is required to provide feedback.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [bookingId, navigation]);

  /**
   * Gets enhanced booking info for display
   */
  const getEnhancedBookingInfo = () => {
    if (!bookingInfo) return null;

    // Get time slot display name
    const timeSlot = timeSlots.find(slot => slot.id === bookingInfo.timeSlot);
    const timeSlotDisplay = timeSlot ? timeSlot.label : bookingInfo.timeSlot;

    // Get waste type display name
    const wasteType = wasteTypes.find(type => type.id === bookingInfo.wasteType);
    const wasteTypeDisplay = wasteType ? wasteType.label : bookingInfo.wasteType;

    return {
      ...bookingInfo,
      timeSlot: timeSlotDisplay,
      wasteType: wasteTypeDisplay,
      displayDate: DateUtils.formatDisplayDate(bookingInfo.scheduledDate),
      binCount: bookingInfo.binIds ? bookingInfo.binIds.length : 0
    };
  };

  /**
   * Handles feedback submission
   */
  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await SchedulingService.submitFeedback({
        bookingId: bookingId,
        rating: feedbackData.rating,
        comment: feedbackData.comment || ''
      });

      setFeedbackResult(result.data);
      setShowSuccessModal(true);

    } catch (err) {
      setLoading(false);
      
      // Handle specific error cases
      if (err.code === 'BOOKING_NOT_FOUND') {
        Alert.alert(
          'Booking Not Found',
          'The booking information could not be found. Please contact support if this issue persists.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else if (err.code === 'FEEDBACK_EXISTS') {
        Alert.alert(
          'Feedback Already Provided',
          'You have already provided feedback for this collection. Thank you for your input!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else if (err.code === 'INVALID_BOOKING_STATUS') {
        Alert.alert(
          'Collection Not Complete',
          'Feedback can only be provided after the waste collection has been completed.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        setError(err.error || 'Failed to submit feedback. Please try again.');
      }
    }
  };

  /**
   * Handles skipping feedback
   */
  const handleFeedbackSkip = () => {
    Alert.alert(
      'Skip Feedback',
      'Are you sure you want to skip providing feedback? Your input helps us improve our service.',
      [
        { text: 'Provide Feedback', style: 'cancel' },
        { 
          text: 'Skip', 
          style: 'destructive',
          onPress: () => {
            // Log the skip action for analytics
            console.log('📊 FEEDBACK SKIPPED:', {
              bookingId: bookingId,
              timestamp: new Date().toISOString(),
              reason: 'user_skip'
            });
            
            navigation.goBack();
          }
        }
      ]
    );
  };

  /**
   * Handles successful feedback submission
   */
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    
    // Navigate back to home or booking history
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }], // Assuming there's a Home screen
    });
  };

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
            <Text style={styles.successIcon}>🌟</Text>
            <Text style={styles.successTitle}>Thank You!</Text>
          </View>
          
          <View style={styles.successContent}>
            <Text style={styles.successMessage}>
              {feedbackResult?.message || 'Your feedback has been submitted successfully.'}
            </Text>
            
            {feedbackResult?.averageRating && (
              <View style={styles.ratingInfo}>
                <Text style={styles.ratingInfoText}>
                  Our current average rating: {feedbackResult.averageRating}/5 ⭐
                </Text>
              </View>
            )}
            
            <View style={styles.impactInfo}>
              <Text style={styles.impactTitle}>Your Impact</Text>
              <Text style={styles.impactText}>
                Your feedback helps us improve our waste collection service and contribute to a cleaner environment. Thank you for being part of our sustainable community!
              </Text>
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

  /**
   * Renders header with navigation
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={[
          styles.backButtonText,
          loading && styles.disabledText
        ]}>
          ← Back
        </Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Feedback</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  /**
   * Renders error state
   */
  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Submission Failed</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setError(null)}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Renders help section
   */
  const renderHelpSection = () => (
    <View style={styles.helpContainer}>
      <Text style={styles.helpTitle}>Need Help?</Text>
      <Text style={styles.helpText}>
        If you experienced any issues with your collection or have specific concerns, please contact our support team.
      </Text>
      
      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => {
          Alert.alert(
            'Contact Support',
            'Phone: +94 11 123 4567\nEmail: support@wastemanagement.lk\n\nWould you like to call now?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Call Now', onPress: () => console.log('📞 Calling support...') }
            ]
          );
        }}
      >
        <Text style={styles.contactButtonText}>📞 Contact Support</Text>
      </TouchableOpacity>
    </View>
  );

  // Don't render if no booking ID
  if (!bookingId) {
    return null;
  }

  const enhancedBookingInfo = getEnhancedBookingInfo();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      {renderHeader()}

      {/* Error Display */}
      {renderError()}

      {/* Feedback Form */}
      {!error && (
        <FeedbackForm
          onSubmit={handleFeedbackSubmit}
          onSkip={handleFeedbackSkip}
          loading={loading}
          disabled={loading}
          error={error}
          bookingInfo={enhancedBookingInfo}
          style={styles.feedbackForm}
        />
      )}

      {/* Help Section */}
      {!error && renderHelpSection()}

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
  disabledText: {
    color: colors.disabled
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
  feedbackForm: {
    flex: 1
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 8
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  helpContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderTopWidth: 4,
    borderTopColor: colors.secondary
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8
  },
  helpText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16
  },
  contactButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  contactButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
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
  successMessage: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22
  },
  ratingInfo: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center'
  },
  ratingInfoText: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '600'
  },
  impactInfo: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 8
  },
  impactText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20
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

export default ProvideFeedbackScreen;
