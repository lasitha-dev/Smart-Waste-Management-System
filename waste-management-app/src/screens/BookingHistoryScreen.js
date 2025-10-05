/**
 * Booking History Screen
 * Screen for viewing past and upcoming waste collection bookings
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module BookingHistoryScreen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SchedulingService from '../api/schedulingService';
import { mockResident } from '../api/mockData';
import { NavigationHelpers } from '../navigation/NavigationHelpers';
import { DateUtils, formatCurrency } from '../utils/schedulingHelpers';

/**
 * BookingHistory Screen Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 */
const BookingHistoryScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

  useEffect(() => {
    loadBookingHistory();
  }, []);

  /**
   * Loads booking history from service
   */
  const loadBookingHistory = async () => {
    try {
      setLoading(true);
      const result = await SchedulingService.getBookingHistory(mockResident.id);
      setBookings(result.data.bookings);
    } catch (error) {
      console.error('Failed to load booking history:', error);
      Alert.alert(
        'Error',
        'Failed to load booking history. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookingHistory();
    setRefreshing(false);
  };

  /**
   * Filters bookings based on selected filter
   */
  const getFilteredBookings = () => {
    switch (filter) {
      case 'upcoming':
        return bookings.filter(booking => booking.status === 'confirmed');
      case 'completed':
        return bookings.filter(booking => booking.status === 'completed');
      case 'cancelled':
        return bookings.filter(booking => booking.status === 'cancelled');
      default:
        return bookings;
    }
  };

  /**
   * Handles booking cancellation
   */
  const handleCancelBooking = (booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel the collection scheduled for ${DateUtils.formatDisplayDate(booking.scheduledDate)}?`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              await SchedulingService.cancelBooking(booking.id, 'Cancelled by user');
              Alert.alert('Success', 'Booking cancelled successfully');
              loadBookingHistory(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', error.error || 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  /**
   * Handles providing feedback
   */
  const handleProvideFeedback = (booking) => {
    NavigationHelpers.navigateToFeedback(navigation, booking.id, {
      id: booking.id,
      scheduledDate: booking.scheduledDate,
      timeSlot: booking.timeSlot,
      wasteType: booking.wasteType,
      binIds: booking.binIds,
      totalFee: booking.totalFee,
      status: booking.status
    });
  };

  /**
   * Gets status color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return colors.secondary;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  /**
   * Gets status display text
   */
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  /**
   * Renders filter tabs
   */
  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'all', label: 'All' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              filter === tab.key && styles.activeFilterTab
            ]}
            onPress={() => setFilter(tab.key)}
          >
            <Text style={[
              styles.filterTabText,
              filter === tab.key && styles.activeFilterTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  /**
   * Renders booking card
   */
  const renderBookingCard = (booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingDateContainer}>
          <Text style={styles.bookingDate}>
            {DateUtils.formatDisplayDate(booking.scheduledDate)}
          </Text>
          <Text style={styles.bookingTime}>{booking.timeSlot}</Text>
        </View>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(booking.status) }
        ]}>
          <Text style={styles.statusText}>
            {getStatusDisplay(booking.status)}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Waste Type:</Text>
          <Text style={styles.detailValue}>{booking.wasteType}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Bins:</Text>
          <Text style={styles.detailValue}>{booking.binIds.length} selected</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Fee:</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(booking.totalFee)}
          </Text>
        </View>
        
        {booking.confirmationNumber && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Confirmation:</Text>
            <Text style={styles.confirmationNumber}>
              {booking.confirmationNumber}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {booking.status === 'confirmed' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelBooking(booking)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        {booking.status === 'completed' && !booking.feedback && (
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => handleProvideFeedback(booking)}
          >
            <Text style={styles.feedbackButtonText}>Rate Service</Text>
          </TouchableOpacity>
        )}
        
        {booking.status === 'completed' && booking.feedback && (
          <View style={styles.feedbackInfo}>
            <Text style={styles.feedbackText}>
              ⭐ Rated {booking.feedback.rating}/5
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  /**
   * Renders empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No Bookings Found</Text>
      <Text style={styles.emptyMessage}>
        {filter === 'all' 
          ? "You haven't made any bookings yet. Schedule your first collection!"
          : `No ${filter} bookings found.`
        }
      </Text>
      
      {filter === 'all' && (
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => NavigationHelpers.navigateToScheduling(navigation)}
        >
          <Text style={styles.scheduleButtonText}>Schedule Collection</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  /**
   * Renders loading state
   */
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingIcon}>📋</Text>
      <Text style={styles.loadingText}>Loading booking history...</Text>
    </View>
  );

  const filteredBookings = getFilteredBookings();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking History</Text>
        <TouchableOpacity
          style={styles.scheduleHeaderButton}
          onPress={() => NavigationHelpers.navigateToScheduling(navigation)}
        >
          <Text style={styles.scheduleHeaderButtonText}>+ Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      {!loading && renderFilterTabs()}

      {/* Content */}
      {loading ? (
        renderLoadingState()
      ) : filteredBookings.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          style={styles.content}
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
          {filteredBookings.map(renderBookingCard)}
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text
  },
  scheduleHeaderButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  scheduleHeaderButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  filterContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 12
  },
  activeFilterTab: {
    backgroundColor: colors.primary
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary
  },
  activeFilterTabText: {
    color: 'white'
  },
  content: {
    flex: 1,
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
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
    lineHeight: 22,
    marginBottom: 24
  },
  scheduleButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  bookingCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  bookingDateContainer: {
    flex: 1
  },
  bookingDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text
  },
  bookingTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  bookingDetails: {
    marginBottom: 16
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  confirmationNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
    fontFamily: 'monospace'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  cancelButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  feedbackButton: {
    backgroundColor: colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  feedbackButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  feedbackInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  feedbackText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600'
  }
});

export default BookingHistoryScreen;
