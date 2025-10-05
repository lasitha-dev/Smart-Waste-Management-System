/**
 * SchedulePickup Screen
 * Main screen for selecting bins and initiating waste collection scheduling
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module SchedulePickupScreen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BinCard from '../../components/BinCard';
import ErrorBoundary, { ScreenErrorBoundary } from '../../components/ErrorBoundary';
import LoadingIndicator, { SkeletonLoader, InlineLoader } from '../../components/LoadingIndicator';
import { ToastManager, StatusMessage } from '../../components/Toast';
import ProgressIndicator from '../../components/ProgressIndicator';
import { useAsyncState } from '../../hooks/useAsyncState';
import SchedulingService from '../../api/schedulingService';
import { mockResident } from '../../api/mockData';
import { needsAutoPickup } from '../../utils/schedulingHelpers';
import { 
  ErrorHandler, 
  SchedulingErrorHandler, 
  NetworkErrorHandler,
  AppError,
  ErrorTypes,
  ErrorSeverity 
} from '../../utils/errorHandling';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';

/**
 * SchedulePickup Screen Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.route - Route parameters
 */
const SchedulePickupScreen = ({ navigation, route }) => {
  const [bins, setBins] = useState([]);
  const [selectedBins, setSelectedBins] = useState([]);
  const [autoPickupBins, setAutoPickupBins] = useState([]);
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);

  // Enhanced async state management
  const {
    loading,
    error,
    execute: executeBinLoad,
    retry: retryBinLoad
  } = useAsyncState({
    onSuccess: (result) => {
      setBins(result.data.bins);
      setAutoPickupBins(result.data.autoPickupBins);
      setShowRetryPrompt(false);
      
      // Show auto-pickup notification if there are bins needing pickup
      if (result.data.hasAutoPickup) {
        showAutoPickupAlert(result.data.autoPickupBins);
      }
    },
    onError: (err) => {
      setShowRetryPrompt(true);
      handleLoadError(err);
    },
    showErrorToast: false, // We'll handle error display manually
    timeout: 15000
  });

  const [refreshing, setRefreshing] = useState(false);

  // Progress tracking for the scheduling flow
  const schedulingSteps = [
    { title: 'Select Bins', subtitle: 'Choose bins for collection' },
    { title: 'Date & Time', subtitle: 'Pick collection schedule' },
    { title: 'Confirm', subtitle: 'Review and confirm' }
  ];

  useEffect(() => {
    loadBins();
  }, []);

  useEffect(() => {
    // Auto-select bins that need pickup
    if (autoPickupBins.length > 0) {
      const autoSelectedIds = autoPickupBins.map(bin => bin.id);
      setSelectedBins(prev => {
        const newSelection = [...new Set([...prev, ...autoSelectedIds])];
        return newSelection;
      });
    }
  }, [autoPickupBins]);

  /**
   * Enhanced bin loading with better error handling and user feedback
   */
  const loadBins = async () => {
    try {
      const result = await executeBinLoad(
        () => SchedulingService.getResidentBins(mockResident.id)
      );
      return result;
    } catch (err) {
      // Error is handled by useAsyncState
      console.error('Failed to load bins:', err);
    }
  };

  /**
   * Enhanced error handling with specific user guidance
   */
  const handleLoadError = (err) => {
    if (err instanceof AppError) {
      switch (err.code) {
        case ErrorTypes.BUSINESS_RULE_ERROR:
          // Account or bin issues
          if (err.details?.supportActions) {
            showSupportActionAlert(err.message, err.details.supportActions);
          } else {
            ToastManager.error(err.message, 'Account Issue');
          }
          break;
          
        case ErrorTypes.NETWORK_ERROR:
          ToastManager.error(
            'Please check your internet connection and try again.',
            'Connection Error'
          );
          break;
          
        case ErrorTypes.TIMEOUT_ERROR:
          ToastManager.error(
            'The request is taking longer than expected. Please try again.',
            'Timeout Error'
          );
          break;
          
        case ErrorTypes.SYSTEM_ERROR:
          if (err.details?.maintenanceWindow) {
            showMaintenanceAlert(err.details);
          } else {
            ToastManager.error(
              'Our system is temporarily unavailable. Please try again shortly.',
              'System Error'
            );
          }
          break;
          
        default:
          ToastManager.error(
            err.message || 'An unexpected error occurred while loading your bins.',
            'Error'
          );
      }
    } else {
      ToastManager.error(
        'Failed to load bins. Please check your connection and try again.',
        'Loading Error'
      );
    }
  };

  /**
   * Show support action options to user
   */
  const showSupportActionAlert = (message, supportActions) => {
    const buttons = supportActions.map(action => ({
      text: action,
      onPress: () => {
        if (action.includes('Call')) {
          ToastManager.info('Opening phone app...');
          // In real app: Linking.openURL('tel:+94111234567')
        } else if (action.includes('Email')) {
          ToastManager.info('Opening email app...');
          // In real app: Linking.openURL('mailto:support@wastemanagement.lk')
        }
      }
    }));
    
    buttons.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Account Support Required', message, buttons);
  };

  /**
   * Enhanced pull-to-refresh with better feedback
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadBins();
      ToastManager.success('Bins refreshed successfully');
    } catch (err) {
      // Error already handled by loadBins
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Enhanced auto-pickup alert with better presentation
   */
  const showAutoPickupAlert = (urgentBins) => {
    Alert.alert(
      '🚨 Urgent Collection Required',
      `${urgentBins.length} of your smart bins are nearly full and need immediate pickup. They have been automatically selected for your convenience.`,
      [
        { text: 'Got It', style: 'default' },
        { 
          text: 'Learn More', 
          onPress: () => showAutoPickupInfo(urgentBins)
        }
      ]
    );
  };

  /**
   * Handles bin selection/deselection
   */
  const handleBinPress = (bin) => {
    if (bin.status !== 'Active') {
      Alert.alert(
        'Bin Unavailable',
        `This bin is currently ${bin.status.toLowerCase()} and cannot be selected for collection.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedBins(prev => {
      const isSelected = prev.includes(bin.id);
      
      if (isSelected) {
        // Deselecting - check if it's an auto-pickup bin
        if (needsAutoPickup(bin)) {
          Alert.alert(
            'Required Pickup',
            'This bin needs immediate pickup due to high fill level. Are you sure you want to deselect it?',
            [
              { text: 'Keep Selected', style: 'cancel' },
              { 
                text: 'Deselect', 
                style: 'destructive',
                onPress: () => setSelectedBins(prev => prev.filter(id => id !== bin.id))
              }
            ]
          );
          return prev;
        }
        
        return prev.filter(id => id !== bin.id);
      } else {
        // Selecting - check maximum limit
        if (prev.length >= 5) {
          Alert.alert(
            'Selection Limit',
            'You can select a maximum of 5 bins per booking.',
            [{ text: 'OK' }]
          );
          return prev;
        }
        
        return [...prev, bin.id];
      }
    });
  };

  /**
   * Enhanced continue button with loading state
   */
  const handleContinue = () => {
    if (selectedBins.length === 0) {
      ToastManager.warning(
        'Please select at least one bin for collection.',
        'No Bins Selected'
      );
      return;
    }

    // Show success feedback for selection
    ToastManager.success(
      `${selectedBins.length} bin${selectedBins.length !== 1 ? 's' : ''} selected successfully`
    );

    // Get selected bin objects
    const selectedBinObjects = bins.filter(bin => selectedBins.includes(bin.id));
    
    // Navigate to date/time selection
    navigation.navigate('SelectDateTime', {
      selectedBins: selectedBinObjects,
      selectedBinIds: selectedBins
    });
  };

  /**
   * Shows maintenance alert with estimated resolution time
   */
  const showMaintenanceAlert = (maintenanceDetails) => {
    Alert.alert(
      '🔧 System Maintenance',
      `Our bin data service is currently undergoing maintenance.\n\nEstimated resolution: ${maintenanceDetails.estimatedResolution}\n\nWe apologize for the inconvenience.`,
      [
        { text: 'Set Reminder', onPress: () => console.log('Setting maintenance reminder...') },
        { text: 'Try Again Later', onPress: () => {} },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  /**
   * Shows detailed auto-pickup information
   */
  const showAutoPickupInfo = (urgentBins) => {
    const binDetails = urgentBins.map(bin => 
      `• ${bin.type} (${bin.location}): ${bin.currentFillLevel}% full`
    ).join('\n');

    Alert.alert(
      'Smart Bin Auto-Pickup',
      `Our smart bins monitor fill levels automatically. The following bins have reached their pickup threshold:\n\n${binDetails}\n\nThese bins have been pre-selected to ensure timely collection and prevent overflow.`,
      [
        { text: 'Learn More About Smart Bins', onPress: () => showSmartBinInfo() },
        { text: 'Got It', style: 'default' }
      ]
    );
  };

  /**
   * Shows smart bin technology information
   */
  const showSmartBinInfo = () => {
    Alert.alert(
      '📱 Smart Bin Technology',
      'Our smart bins use IoT sensors to:\n\n• Monitor fill levels in real-time\n• Predict optimal collection times\n• Reduce unnecessary trips\n• Prevent bin overflow\n• Optimize collection routes\n\nThis helps us provide better service while reducing environmental impact.',
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  /**
   * Handles contact support action
   */
  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact our support team?',
      [
        {
          text: 'Call Support',
          onPress: () => {
            ToastManager.info('Opening phone app...');
            // In real app: Linking.openURL('tel:+94111234567')
          }
        },
        {
          text: 'Email Support', 
          onPress: () => {
            ToastManager.info('Opening email app...');
            // In real app: Linking.openURL('mailto:support@wastemanagement.lk')
          }
        },
        {
          text: 'Live Chat',
          onPress: () => {
            ToastManager.info('Opening live chat...');
            // Navigate to chat screen or open chat widget
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  /**
   * Enhanced loading state with skeleton loader
   */
  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <ProgressIndicator
        steps={schedulingSteps}
        currentStep={0}
        loading={true}
        showLabels={false}
        showProgress={true}
      />
      <SkeletonLoader count={3} style={styles.skeletonContainer} />
      <Text style={styles.loadingLabel}>Loading your bins...</Text>
    </View>
  );

  /**
   * Enhanced error state with retry options
   */
  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Unable to Load Bins</Text>
      <StatusMessage
        type="error"
        message={error?.message || 'Failed to load your bins'}
        visible={true}
        action={{
          text: 'Retry',
          onPress: () => {
            setShowRetryPrompt(false);
            loadBins();
          }
        }}
        style={styles.errorStatusMessage}
      />
      
      {showRetryPrompt && (
        <View style={styles.retryOptions}>
          <TouchableOpacity
            style={styles.primaryRetryButton}
            onPress={() => {
              setShowRetryPrompt(false);
              loadBins();
            }}
          >
            <Text style={styles.primaryRetryText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryRetryButton}
            onPress={() => ToastManager.info('Opening support...')}
          >
            <Text style={styles.secondaryRetryText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  /**
   * Renders empty state
   */
  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>No Bins Available</Text>
      <Text style={styles.emptyMessage}>
        No active bins found in your account. Please contact support to link bins to your account.
      </Text>
      <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
        <Text style={styles.supportButtonText}>Contact Support</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Enhanced header with progress indicator
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <ProgressIndicator
        steps={schedulingSteps}
        currentStep={0}
        showLabels={true}
        showProgress={true}
        style={styles.progressIndicator}
      />
      
      <Text style={styles.headerTitle}>Schedule Waste Collection</Text>
      <Text style={styles.headerSubtitle}>
        Select bins for collection ({selectedBins.length} selected)
      </Text>
      
      {autoPickupBins.length > 0 && (
        <StatusMessage
          type="warning"
          title="Urgent Collection Required"
          message={`${autoPickupBins.length} bin(s) need immediate pickup`}
          visible={true}
          style={styles.urgentNotice}
        />
      )}
    </View>
  );

  /**
   * Renders bin list
   */
  const renderBinList = () => (
    <ScrollView
      style={styles.binList}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {bins.map(bin => (
        <BinCard
          key={bin.id}
          bin={bin}
          selected={selectedBins.includes(bin.id)}
          onPress={handleBinPress}
          disabled={bin.status !== 'Active'}
          showWeight={true}
        />
      ))}
      
      {/* Selection Summary */}
      {selectedBins.length > 0 && (
        <View style={styles.selectionSummary}>
          <Text style={styles.summaryTitle}>Selection Summary</Text>
          <Text style={styles.summaryText}>
            {selectedBins.length} bin{selectedBins.length !== 1 ? 's' : ''} selected for collection
          </Text>
          
          {autoPickupBins.some(bin => selectedBins.includes(bin.id)) && (
            <Text style={styles.urgentText}>
              ⚡ Includes urgent pickup required bins
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );

  /**
   * Enhanced continue button with loading feedback
   */
  const renderContinueButton = () => {
    const canContinue = selectedBins.length > 0;
    
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
          {loading ? (
            <InlineLoader text="Processing..." size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.continueButtonText,
              !canContinue && styles.disabledButtonText
            ]}>
              Continue ({selectedBins.length} bin{selectedBins.length !== 1 ? 's' : ''})
            </Text>
          )}
        </TouchableOpacity>
        
        <StatusMessage
          type="info"
          message="💡 Smart bins with high fill levels are automatically selected"
          visible={true}
          style={styles.helpMessage}
        />
      </View>
    );
  };

  return (
    <ScreenErrorBoundary screenName="SchedulePickup">
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        
        {loading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : bins.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {renderHeader()}
            {renderBinList()}
            {renderContinueButton()}
          </>
        )}
      </SafeAreaView>
    </ScreenErrorBoundary>
  );
};

// Colors imported from constants

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  loadingText: {
    fontSize: 48,
    marginBottom: 16
  },
  loadingLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16
  },
  skeletonContainer: {
    width: '100%',
    marginVertical: 16
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
    marginBottom: 24
  },
  errorStatusMessage: {
    marginVertical: 16,
    width: '100%'
  },
  retryOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  primaryRetryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1
  },
  primaryRetryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  secondaryRetryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1
  },
  secondaryRetryText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22
  },
  supportButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  supportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background
  },
  progressIndicator: {
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary
  },
  urgentNotice: {
    marginTop: 12
  },
  autoPickupNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning
  },
  autoPickupIcon: {
    fontSize: 16,
    marginRight: 8
  },
  autoPickupText: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '600',
    flex: 1
  },
  binList: {
    flex: 1
  },
  selectionSummary: {
    margin: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary
  },
  urgentText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
    marginTop: 4
  },
  buttonContainer: {
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
    fontSize: 18,
    fontWeight: 'bold'
  },
  disabledButtonText: {
    color: '#FFFFFF'
  },
  helpMessage: {
    marginTop: 12
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16
  }
});

export default SchedulePickupScreen;
