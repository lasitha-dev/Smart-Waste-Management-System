/**
 * Offline Support System
 * Handles offline scenarios and provides offline-first capabilities
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module OfflineSupport
 */

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AppError, ErrorTypes, ErrorSeverity } from './errorHandling';

/**
 * Offline storage keys
 */
const STORAGE_KEYS = {
  CACHED_BINS: '@waste_management_cached_bins',
  PENDING_BOOKINGS: '@waste_management_pending_bookings',
  CACHED_HISTORY: '@waste_management_cached_history',
  OFFLINE_FEEDBACK: '@waste_management_offline_feedback',
  LAST_SYNC: '@waste_management_last_sync'
};

/**
 * Network connectivity manager
 */
export class NetworkManager {
  static isOnline = true;
  static listeners = [];

  /**
   * Initializes network monitoring
   */
  static initialize() {
    NetInfo.addEventListener(state => {
      const wasOffline = !NetworkManager.isOnline;
      NetworkManager.isOnline = state.isConnected;
      
      // Notify listeners of network change
      NetworkManager.listeners.forEach(listener => {
        listener(NetworkManager.isOnline, wasOffline);
      });

      // Show offline/online alerts
      if (!NetworkManager.isOnline && !wasOffline) {
        NetworkManager.showOfflineAlert();
      } else if (NetworkManager.isOnline && wasOffline) {
        NetworkManager.showOnlineAlert();
      }
    });
  }

  /**
   * Adds network change listener
   */
  static addNetworkListener(listener) {
    NetworkManager.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = NetworkManager.listeners.indexOf(listener);
      if (index > -1) {
        NetworkManager.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Shows offline alert
   */
  static showOfflineAlert() {
    Alert.alert(
      '📡 You\'re Offline',
      'No internet connection detected. You can still browse cached data and create bookings that will be synced when you\'re back online.',
      [
        { text: 'Use Offline Mode', style: 'default' },
        { text: 'Retry Connection', onPress: () => NetworkManager.checkConnection() }
      ]
    );
  }

  /**
   * Shows online alert
   */
  static showOnlineAlert() {
    Alert.alert(
      '🌐 Back Online',
      'Internet connection restored. Syncing your data now...',
      [{ text: 'OK', style: 'default' }]
    );
    
    // Trigger sync
    OfflineManager.syncPendingData();
  }

  /**
   * Manually checks connection
   */
  static async checkConnection() {
    const state = await NetInfo.fetch();
    NetworkManager.isOnline = state.isConnected;
    return NetworkManager.isOnline;
  }
}

/**
 * Offline data manager
 */
export class OfflineManager {
  /**
   * Caches bins data for offline use
   */
  static async cacheBinsData(binsData) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CACHED_BINS,
        JSON.stringify({
          data: binsData,
          timestamp: new Date().toISOString()
        })
      );
    } catch (error) {
      console.error('Failed to cache bins data:', error);
    }
  }

  /**
   * Gets cached bins data
   */
  static async getCachedBinsData() {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_BINS);
      if (cached) {
        const parsedData = JSON.parse(cached);
        const cacheAge = Date.now() - new Date(parsedData.timestamp).getTime();
        
        // Return cached data if less than 1 hour old
        if (cacheAge < 60 * 60 * 1000) {
          return parsedData.data;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached bins data:', error);
      return null;
    }
  }

  /**
   * Stores booking for later sync
   */
  static async storePendingBooking(bookingData) {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_BOOKINGS);
      const pendingBookings = existing ? JSON.parse(existing) : [];
      
      const pendingBooking = {
        ...bookingData,
        id: `OFFLINE_${Date.now()}`,
        status: 'pending_sync',
        createdOffline: true,
        timestamp: new Date().toISOString()
      };
      
      pendingBookings.push(pendingBooking);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_BOOKINGS,
        JSON.stringify(pendingBookings)
      );
      
      return pendingBooking;
    } catch (error) {
      throw new AppError(
        'Failed to store booking offline',
        ErrorTypes.SYSTEM_ERROR,
        ErrorSeverity.HIGH,
        { originalError: error.message }
      );
    }
  }

  /**
   * Gets pending bookings
   */
  static async getPendingBookings() {
    try {
      const pending = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_BOOKINGS);
      return pending ? JSON.parse(pending) : [];
    } catch (error) {
      console.error('Failed to get pending bookings:', error);
      return [];
    }
  }

  /**
   * Stores feedback for later sync
   */
  static async storeOfflineFeedback(feedbackData) {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_FEEDBACK);
      const offlineFeedback = existing ? JSON.parse(existing) : [];
      
      const feedback = {
        ...feedbackData,
        id: `OFFLINE_FB_${Date.now()}`,
        createdOffline: true,
        timestamp: new Date().toISOString()
      };
      
      offlineFeedback.push(feedback);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_FEEDBACK,
        JSON.stringify(offlineFeedback)
      );
      
      return feedback;
    } catch (error) {
      throw new AppError(
        'Failed to store feedback offline',
        ErrorTypes.SYSTEM_ERROR,
        ErrorSeverity.MEDIUM,
        { originalError: error.message }
      );
    }
  }

  /**
   * Syncs all pending data when back online
   */
  static async syncPendingData() {
    if (!NetworkManager.isOnline) {
      return;
    }

    try {
      // Sync pending bookings
      await OfflineManager.syncPendingBookings();
      
      // Sync offline feedback
      await OfflineManager.syncOfflineFeedback();
      
      // Update last sync timestamp
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_SYNC,
        new Date().toISOString()
      );
      
      console.log('✅ Offline data synced successfully');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
      
      Alert.alert(
        'Sync Failed',
        'Some of your offline data could not be synced. It will be retried automatically.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }

  /**
   * Syncs pending bookings
   */
  static async syncPendingBookings() {
    const pendingBookings = await OfflineManager.getPendingBookings();
    const syncedBookings = [];
    
    for (const booking of pendingBookings) {
      try {
        // In a real app, this would call the actual API
        console.log('Syncing booking:', booking.id);
        
        // Simulate API call success
        syncedBookings.push(booking.id);
      } catch (error) {
        console.error('Failed to sync booking:', booking.id, error);
      }
    }
    
    // Remove synced bookings
    const remainingBookings = pendingBookings.filter(
      booking => !syncedBookings.includes(booking.id)
    );
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_BOOKINGS,
      JSON.stringify(remainingBookings)
    );
  }

  /**
   * Syncs offline feedback
   */
  static async syncOfflineFeedback() {
    const offlineFeedback = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_FEEDBACK);
    if (!offlineFeedback) return;
    
    const feedbackList = JSON.parse(offlineFeedback);
    const syncedFeedback = [];
    
    for (const feedback of feedbackList) {
      try {
        // In a real app, this would call the actual API
        console.log('Syncing feedback:', feedback.id);
        
        // Simulate API call success
        syncedFeedback.push(feedback.id);
      } catch (error) {
        console.error('Failed to sync feedback:', feedback.id, error);
      }
    }
    
    // Remove synced feedback
    const remainingFeedback = feedbackList.filter(
      feedback => !syncedFeedback.includes(feedback.id)
    );
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.OFFLINE_FEEDBACK,
      JSON.stringify(remainingFeedback)
    );
  }

  /**
   * Clears all cached data
   */
  static async clearCache() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CACHED_BINS,
        STORAGE_KEYS.CACHED_HISTORY,
        STORAGE_KEYS.LAST_SYNC
      ]);
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Gets cache status
   */
  static async getCacheStatus() {
    try {
      const [bins, lastSync, pendingBookings, offlineFeedback] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CACHED_BINS),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC),
        AsyncStorage.getItem(STORAGE_KEYS.PENDING_BOOKINGS),
        AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_FEEDBACK)
      ]);

      return {
        hasCachedBins: !!bins,
        lastSync: lastSync ? new Date(lastSync) : null,
        pendingBookings: pendingBookings ? JSON.parse(pendingBookings).length : 0,
        offlineFeedback: offlineFeedback ? JSON.parse(offlineFeedback).length : 0,
        isOnline: NetworkManager.isOnline
      };
    } catch (error) {
      console.error('Failed to get cache status:', error);
      return {
        hasCachedBins: false,
        lastSync: null,
        pendingBookings: 0,
        offlineFeedback: 0,
        isOnline: NetworkManager.isOnline
      };
    }
  }
}

/**
 * Offline-first service wrapper
 */
export class OfflineFirstService {
  /**
   * Wraps a service call with offline support
   */
  static async withOfflineSupport(
    onlineOperation,
    offlineOperation = null,
    cacheKey = null
  ) {
    try {
      if (NetworkManager.isOnline) {
        const result = await onlineOperation();
        
        // Cache the result if cache key provided
        if (cacheKey && result) {
          await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: result,
              timestamp: new Date().toISOString()
            })
          );
        }
        
        return result;
      } else {
        // Try offline operation first
        if (offlineOperation) {
          return await offlineOperation();
        }
        
        // Fall back to cached data
        if (cacheKey) {
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached) {
            const parsedData = JSON.parse(cached);
            console.log('Using cached data for offline operation');
            return parsedData.data;
          }
        }
        
        throw new AppError(
          'This feature requires an internet connection and no cached data is available.',
          ErrorTypes.NETWORK_ERROR,
          ErrorSeverity.MEDIUM,
          { offlineMode: true }
        );
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        'Service temporarily unavailable',
        ErrorTypes.SYSTEM_ERROR,
        ErrorSeverity.MEDIUM,
        { originalError: error.message }
      );
    }
  }
}

/**
 * Offline booking handler
 */
export class OfflineBookingHandler {
  /**
   * Handles booking submission in offline mode
   */
  static async handleOfflineBooking(bookingData) {
    try {
      const offlineBooking = await OfflineManager.storePendingBooking(bookingData);
      
      Alert.alert(
        '📱 Booking Saved Offline',
        'Your booking has been saved and will be submitted automatically when you\'re back online.\n\nBooking ID: ' + offlineBooking.id,
        [
          { text: 'View Pending Bookings', onPress: () => OfflineBookingHandler.showPendingBookings() },
          { text: 'OK', style: 'default' }
        ]
      );
      
      return offlineBooking;
    } catch (error) {
      throw new AppError(
        'Failed to save booking offline',
        ErrorTypes.SYSTEM_ERROR,
        ErrorSeverity.HIGH,
        { originalError: error.message }
      );
    }
  }

  /**
   * Shows pending bookings
   */
  static async showPendingBookings() {
    const pendingBookings = await OfflineManager.getPendingBookings();
    
    if (pendingBookings.length === 0) {
      Alert.alert(
        'No Pending Bookings',
        'All your bookings have been synced successfully.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    const bookingsList = pendingBookings
      .map(booking => `• ${booking.wasteType} - ${booking.scheduledDate}`)
      .join('\n');
    
    Alert.alert(
      'Pending Bookings',
      `The following bookings will be synced when you're online:\n\n${bookingsList}`,
      [
        { text: 'Sync Now', onPress: () => OfflineManager.syncPendingData() },
        { text: 'OK', style: 'default' }
      ]
    );
  }
}

// Initialize network monitoring
NetworkManager.initialize();
