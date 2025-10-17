/**
 * BookingHistory Screen
 * Display past and upcoming waste collection bookings
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module BookingHistoryScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * BookingHistory Screen Component
 */
const BookingHistoryScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

  const bookings = [
    {
      id: 'b1',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      timeSlot: '08:00 AM - 12:00 PM',
      status: 'confirmed',
      bins: ['General Waste', 'Recyclable'],
      fee: 10.00,
      bookingId: '#WC2025001'
    },
    {
      id: 'b2',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      timeSlot: '12:00 PM - 04:00 PM',
      status: 'completed',
      bins: ['Organic Waste'],
      fee: 5.00,
      bookingId: '#WC2025002',
      rating: 5
    },
    {
      id: 'b3',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      timeSlot: '04:00 PM - 08:00 PM',
      status: 'completed',
      bins: ['General Waste', 'Recyclable', 'Organic Waste'],
      fee: 15.00,
      bookingId: '#WC2025003',
      rating: 4
    },
    {
      id: 'b4',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      timeSlot: '08:00 AM - 12:00 PM',
      status: 'cancelled',
      bins: ['General Waste'],
      fee: 5.00,
      bookingId: '#WC2025004'
    }
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#2196F3';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      case 'in-progress':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return '✓';
      case 'completed':
        return '✓';
      case 'cancelled':
        return '✗';
      case 'in-progress':
        return '🚛';
      default:
        return '•';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return booking.status === 'confirmed';
    if (filter === 'completed') return booking.status === 'completed';
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  const renderBookingCard = (booking) => {
    const isPast = booking.status !== 'confirmed';
    const statusColor = getStatusColor(booking.status);

    return (
      <TouchableOpacity
        key={booking.id}
        style={styles.bookingCard}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.bookingHeader}>
          <View style={styles.bookingIdContainer}>
            <Text style={styles.bookingId}>{booking.bookingId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusIcon}>{getStatusIcon(booking.status)}</Text>
              <Text style={styles.statusText}>{booking.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.bookingDetail}>
          <Text style={styles.detailIcon}>📅</Text>
          <View style={styles.detailInfo}>
            <Text style={styles.detailLabel}>Collection Date</Text>
            <Text style={styles.detailValue}>
              {booking.date.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>

        <View style={styles.bookingDetail}>
          <Text style={styles.detailIcon}>🕐</Text>
          <View style={styles.detailInfo}>
            <Text style={styles.detailLabel}>Time Slot</Text>
            <Text style={styles.detailValue}>{booking.timeSlot}</Text>
          </View>
        </View>

        {/* Bins */}
        <View style={styles.bookingDetail}>
          <Text style={styles.detailIcon}>🗑️</Text>
          <View style={styles.detailInfo}>
            <Text style={styles.detailLabel}>Bins ({booking.bins.length})</Text>
            <Text style={styles.detailValue}>{booking.bins.join(', ')}</Text>
          </View>
        </View>

        {/* Fee & Actions */}
        <View style={styles.bookingFooter}>
          <View style={styles.feeContainer}>
            <Text style={styles.feeLabel}>Fee:</Text>
            <Text style={styles.feeValue}>${booking.fee.toFixed(2)}</Text>
          </View>

          {booking.status === 'confirmed' && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Modify</Text>
            </TouchableOpacity>
          )}

          {booking.status === 'completed' && !booking.rating && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ProvideFeedback')}
            >
              <Text style={styles.actionButtonText}>Rate</Text>
            </TouchableOpacity>
          )}

          {booking.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStars}>{'★'.repeat(booking.rating)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filterValue, label) => {
    const isActive = filter === filterValue;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setFilter(filterValue)}
      >
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('upcoming', 'Upcoming')}
          {renderFilterButton('completed', 'Completed')}
          {renderFilterButton('cancelled', 'Cancelled')}
        </ScrollView>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'You haven\'t made any bookings yet'
                : `No ${filter} bookings`}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={() => navigation.navigate('Schedule')}
              >
                <Text style={styles.scheduleButtonText}>Schedule Pickup</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {filteredBookings.map(booking => renderBookingCard(booking))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8
  },
  filterButtonActive: {
    backgroundColor: '#2E7D32'
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600'
  },
  filterTextActive: {
    color: '#FFFFFF'
  },
  content: {
    flex: 1
  },
  bookingsList: {
    padding: 16,
    gap: 16
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  bookingHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  bookingIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bookingId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  statusIcon: {
    color: '#FFFFFF',
    fontSize: 10
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  bookingDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24
  },
  detailInfo: {
    flex: 1
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  feeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8
  },
  feeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32'
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingStars: {
    fontSize: 16,
    color: '#FFD700'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24
  },
  scheduleButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default BookingHistoryScreen;
