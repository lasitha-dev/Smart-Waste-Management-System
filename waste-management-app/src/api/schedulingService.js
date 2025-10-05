/**
 * Scheduling Service - Core business logic for waste collection scheduling
 * Contains all API-like functions for the scheduling module with mock implementations
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module SchedulingService
 */

import {
  mockResident,
  mockBins,
  wasteTypes,
  timeSlots,
  mockBookingHistory,
  notificationTemplates,
  systemConfig
} from './mockData';

import {
  DateUtils,
  FeeCalculator,
  ValidationUtils,
  generateBookingId,
  generateFeedbackId,
  needsAutoPickup
} from '../utils/schedulingHelpers';

import {
  ErrorHandler,
  AppError,
  ErrorTypes,
  ErrorSeverity,
  ErrorRecovery
} from '../utils/errorHandling';

// In-memory storage for mock data (in real app, this would be handled by backend)
let bookingStorage = [...mockBookingHistory];
let feedbackStorage = [];
let notificationStorage = [];

/**
 * Service class containing all scheduling-related operations
 */
class SchedulingService {
  /**
   * Retrieves bins linked to a specific resident
   * @param {string} residentId - The resident's ID
   * @returns {Promise<Object>} Promise resolving to bins data or error
   */
  static async getResidentBins(residentId) {
    return ErrorHandler.withTimeout(
      new Promise((resolve, reject) => {
        // Simulate API delay with potential network issues
        const delay = Math.random() > 0.9 ? 5000 : 800; // 10% chance of slow response
        
        setTimeout(() => {
          try {
            // Simulate random network failures (5% chance)
            if (Math.random() < 0.05) {
              throw new AppError(
                'Network connection failed',
                ErrorTypes.NETWORK_ERROR,
                ErrorSeverity.MEDIUM
              );
            }

            if (!residentId) {
              reject(new AppError(
                'Resident ID is required',
                ErrorTypes.VALIDATION_ERROR,
                ErrorSeverity.LOW,
                { field: 'residentId' }
              ));
              return;
            }

            // Check if resident exists and account is active
            if (mockResident.id !== residentId) {
              reject(new AppError(
                'Resident account not found. Please check your login credentials.',
                ErrorTypes.RESOURCE_NOT_FOUND,
                ErrorSeverity.HIGH,
                { residentId }
              ));
              return;
            }

            if (mockResident.accountStatus !== 'active') {
              reject(new AppError(
                'Your account is currently inactive. Please contact our support team at +94 11 123 4567 to reactivate your account.',
                ErrorTypes.BUSINESS_RULE_ERROR,
                ErrorSeverity.HIGH,
                { 
                  accountStatus: mockResident.accountStatus,
                  supportPhone: '+94 11 123 4567',
                  supportEmail: 'support@wastemanagement.lk'
                }
              ));
              return;
            }

            // Get bins linked to resident
            const linkedBins = mockBins.filter(bin => 
              mockResident.linkedBins.includes(bin.id)
            );

            if (linkedBins.length === 0) {
              reject(new AppError(
                'No waste bins are currently linked to your account. Please contact support to register your bins.',
                ErrorTypes.BUSINESS_RULE_ERROR,
                ErrorSeverity.HIGH,
                { 
                  residentId,
                  supportActions: [
                    'Call +94 11 123 4567',
                    'Email support@wastemanagement.lk',
                    'Visit nearest service center'
                  ]
                }
              ));
              return;
            }

            // Filter only active bins
            const activeBins = linkedBins.filter(bin => bin.status === 'Active');
            
            if (activeBins.length === 0) {
              reject(new AppError(
                'All your bins are currently inactive. Please contact support for assistance.',
                ErrorTypes.BUSINESS_RULE_ERROR,
                ErrorSeverity.HIGH,
                { 
                  totalBins: linkedBins.length,
                  inactiveBins: linkedBins.filter(bin => bin.status !== 'Active')
                }
              ));
              return;
            }

            // Check for bins that need automatic pickup
            const autoPickupBins = activeBins.filter(needsAutoPickup);
            
            // Check for maintenance issues (simulate 2% chance)
            if (Math.random() < 0.02) {
              reject(new AppError(
                'Bin data service is temporarily unavailable due to maintenance. Please try again in a few minutes.',
                ErrorTypes.SYSTEM_ERROR,
                ErrorSeverity.MEDIUM,
                { 
                  maintenanceWindow: 'System maintenance in progress',
                  estimatedResolution: '15 minutes'
                }
              ));
              return;
            }

            resolve({
              success: true,
              data: {
                bins: activeBins,
                totalBins: activeBins.length,
                autoPickupBins: autoPickupBins,
                hasAutoPickup: autoPickupBins.length > 0,
                resident: {
                  id: mockResident.id,
                  name: mockResident.name,
                  billingModel: mockResident.billingModel
                },
                systemStatus: {
                  allSystemsOperational: true,
                  lastUpdated: new Date().toISOString()
                }
              }
            });
          } catch (error) {
            if (error instanceof AppError) {
              reject(error);
            } else {
              reject(new AppError(
                'An unexpected error occurred while retrieving your bins',
                ErrorTypes.SYSTEM_ERROR,
                ErrorSeverity.HIGH,
                { originalError: error.message }
              ));
            }
          }
        }, delay);
      }),
      10000 // 10 second timeout
    );
  }

  /**
   * Checks availability for a specific date and time slot
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} timeSlot - Time slot ID
   * @returns {Promise<Object>} Promise resolving to availability status
   */
  static async checkAvailability(date, timeSlot) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (!date || !timeSlot) {
            reject({
              success: false,
              error: 'Date and time slot are required',
              code: 'MISSING_PARAMETERS'
            });
            return;
          }

          // Validate the date
          const dateValidation = DateUtils.validateScheduleDate(date);
          if (!dateValidation.isValid) {
            reject({
              success: false,
              error: dateValidation.reason,
              code: 'INVALID_DATE'
            });
            return;
          }

          // Check if time slot exists
          const slot = timeSlots.find(slot => slot.id === timeSlot);
          if (!slot) {
            reject({
              success: false,
              error: 'Invalid time slot',
              code: 'INVALID_TIME_SLOT'
            });
            return;
          }

          // Mock availability check - simulate some slots being unavailable
          const dateObj = new Date(date);
          const dayOfMonth = dateObj.getDate();
          
          // Make some random slots unavailable for demonstration
          const isUnavailable = (dayOfMonth % 7 === 0 && timeSlot === 'morning') ||
                               (dayOfMonth % 5 === 0 && timeSlot === 'evening');

          if (isUnavailable) {
            // Suggest alternative slots
            const availableSlots = timeSlots.filter(s => s.id !== timeSlot);
            const nextAvailableDate = DateUtils.getNextAvailableDate();

            reject({
              success: false,
              error: 'Selected time slot is not available',
              code: 'SLOT_UNAVAILABLE',
              alternatives: {
                sameDay: availableSlots,
                nextAvailableDate: nextAvailableDate,
                suggestedSlots: availableSlots.slice(0, 2)
              }
            });
            return;
          }

          resolve({
            success: true,
            data: {
              available: true,
              date: date,
              timeSlot: slot,
              message: 'Time slot is available for booking'
            }
          });
        } catch (error) {
          reject({
            success: false,
            error: 'Failed to check availability',
            code: 'SERVICE_ERROR',
            details: error.message
          });
        }
      }, 600);
    });
  }

  /**
   * Calculates fee for waste collection based on various parameters
   * @param {Object} params - Fee calculation parameters
   * @returns {Promise<Object>} Promise resolving to fee breakdown
   */
  static async calculateFee(params) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const {
            wasteType,
            binIds = [],
            billingModel = mockResident.billingModel,
            estimatedWeight = 0
          } = params;

          if (!wasteType) {
            reject({
              success: false,
              error: 'Waste type is required',
              code: 'MISSING_WASTE_TYPE'
            });
            return;
          }

          if (binIds.length === 0) {
            reject({
              success: false,
              error: 'At least one bin must be selected',
              code: 'NO_BINS_SELECTED'
            });
            return;
          }

          // Validate waste type
          const wasteTypeData = wasteTypes.find(type => type.id === wasteType);
          if (!wasteTypeData) {
            reject({
              success: false,
              error: 'Invalid waste type',
              code: 'INVALID_WASTE_TYPE'
            });
            return;
          }

          // Calculate fee using helper function
          const feeBreakdown = FeeCalculator.calculateTotalFee(
            billingModel,
            wasteType,
            binIds.length,
            estimatedWeight
          );

          resolve({
            success: true,
            data: {
              ...feeBreakdown,
              wasteType: wasteTypeData,
              binCount: binIds.length,
              estimatedWeight: estimatedWeight,
              currency: 'LKR'
            }
          });
        } catch (error) {
          reject({
            success: false,
            error: 'Failed to calculate fee',
            code: 'CALCULATION_ERROR',
            details: error.message
          });
        }
      }, 400);
    });
  }

  /**
   * Submits a booking request
   * @param {Object} bookingData - Complete booking information
   * @returns {Promise<Object>} Promise resolving to booking confirmation
   */
  static async submitBooking(bookingData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Validate booking data
          const validation = ValidationUtils.validateBookingData(bookingData);
          if (!validation.isValid) {
            reject({
              success: false,
              error: 'Invalid booking data',
              code: 'VALIDATION_ERROR',
              details: validation.errors
            });
            return;
          }

          // Check availability again before booking
          SchedulingService.checkAvailability(bookingData.scheduledDate, bookingData.timeSlot)
            .then(() => {
              // Generate booking ID and create booking record
              const bookingId = generateBookingId();
              const booking = {
                id: bookingId,
                ...bookingData,
                status: 'confirmed',
                createdAt: new Date().toISOString(),
                confirmationNumber: `WM${Date.now()}`,
                estimatedCompletionTime: SchedulingService._calculateEstimatedCompletion(
                  bookingData.scheduledDate,
                  bookingData.timeSlot
                )
              };

              // Store booking (in real app, this would be saved to database)
              bookingStorage.push(booking);

              // Send confirmation notification
              SchedulingService.sendNotification(
                bookingData.residentId,
                'bookingConfirmation',
                {
                  date: DateUtils.formatDisplayDate(bookingData.scheduledDate),
                  timeSlot: timeSlots.find(slot => slot.id === bookingData.timeSlot)?.label
                }
              );

              resolve({
                success: true,
                data: {
                  booking: booking,
                  message: 'Booking confirmed successfully',
                  nextSteps: [
                    'You will receive a reminder 24 hours before collection',
                    'Please ensure bins are accessible on collection day',
                    'You can track your booking status in the app'
                  ]
                }
              });
            })
            .catch((availabilityError) => {
              reject({
                success: false,
                error: 'Time slot no longer available',
                code: 'SLOT_UNAVAILABLE',
                details: availabilityError
              });
            });
        } catch (error) {
          reject({
            success: false,
            error: 'Failed to submit booking',
            code: 'BOOKING_ERROR',
            details: error.message
          });
        }
      }, 1000);
    });
  }

  /**
   * Sends notification to resident (mock implementation)
   * @param {string} residentId - Resident ID
   * @param {string} templateType - Notification template type
   * @param {Object} data - Template data for personalization
   * @returns {Promise<Object>} Promise resolving to notification status
   */
  static async sendNotification(residentId, templateType, data = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const template = notificationTemplates[templateType];
          if (!template) {
            console.warn(`Unknown notification template: ${templateType}`);
            resolve({
              success: false,
              error: 'Unknown notification template'
            });
            return;
          }

          // Replace template variables with actual data
          let message = template.body;
          Object.keys(data).forEach(key => {
            message = message.replace(`{${key}}`, data[key]);
          });

          const notification = {
            id: `NOTIF_${Date.now()}`,
            residentId,
            type: templateType,
            title: template.title,
            message,
            sentAt: new Date().toISOString(),
            status: 'sent'
          };

          // Store notification (mock)
          notificationStorage.push(notification);

          // Mock notification delivery (console log for demo)
          console.log('📱 NOTIFICATION SENT:', {
            to: residentId,
            title: notification.title,
            message: notification.message,
            timestamp: notification.sentAt
          });

          resolve({
            success: true,
            data: notification
          });
        } catch (error) {
          console.error('Failed to send notification:', error);
          resolve({
            success: false,
            error: 'Failed to send notification',
            details: error.message
          });
        }
      }, 200);
    });
  }

  /**
   * Submits feedback for a completed collection
   * @param {Object} feedbackData - Feedback information
   * @returns {Promise<Object>} Promise resolving to feedback submission status
   */
  static async submitFeedback(feedbackData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Validate feedback data
          const validation = ValidationUtils.validateFeedbackData(feedbackData);
          if (!validation.isValid) {
            reject({
              success: false,
              error: 'Invalid feedback data',
              code: 'VALIDATION_ERROR',
              details: validation.errors
            });
            return;
          }

          // Check if booking exists and is completed
          const booking = bookingStorage.find(b => b.id === feedbackData.bookingId);
          if (!booking) {
            reject({
              success: false,
              error: 'Booking not found',
              code: 'BOOKING_NOT_FOUND'
            });
            return;
          }

          if (booking.status !== 'completed') {
            reject({
              success: false,
              error: 'Can only provide feedback for completed collections',
              code: 'INVALID_BOOKING_STATUS'
            });
            return;
          }

          // Check if feedback already exists
          const existingFeedback = feedbackStorage.find(f => f.bookingId === feedbackData.bookingId);
          if (existingFeedback) {
            reject({
              success: false,
              error: 'Feedback already provided for this booking',
              code: 'FEEDBACK_EXISTS'
            });
            return;
          }

          // Create feedback record
          const feedbackId = generateFeedbackId();
          const feedback = {
            id: feedbackId,
            ...feedbackData,
            submittedAt: new Date().toISOString(),
            residentId: booking.residentId
          };

          // Store feedback
          feedbackStorage.push(feedback);

          // Update booking with feedback reference
          booking.feedback = feedback;

          // Mock feedback processing (console log for demo)
          console.log('⭐ FEEDBACK RECEIVED:', {
            bookingId: feedback.bookingId,
            rating: feedback.rating,
            comment: feedback.comment || 'No comment provided',
            timestamp: feedback.submittedAt
          });

          resolve({
            success: true,
            data: {
              feedback: feedback,
              message: 'Thank you for your feedback! It helps us improve our service.',
              averageRating: SchedulingService._calculateAverageRating()
            }
          });
        } catch (error) {
          reject({
            success: false,
            error: 'Failed to submit feedback',
            code: 'FEEDBACK_ERROR',
            details: error.message
          });
        }
      }, 500);
    });
  }

  /**
   * Gets booking history for a resident
   * @param {string} residentId - Resident ID
   * @returns {Promise<Object>} Promise resolving to booking history
   */
  static async getBookingHistory(residentId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (!residentId) {
            reject({
              success: false,
              error: 'Resident ID is required',
              code: 'MISSING_RESIDENT_ID'
            });
            return;
          }

          const history = bookingStorage
            .filter(booking => booking.residentId === residentId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          resolve({
            success: true,
            data: {
              bookings: history,
              totalBookings: history.length,
              completedBookings: history.filter(b => b.status === 'completed').length,
              pendingBookings: history.filter(b => b.status === 'confirmed').length
            }
          });
        } catch (error) {
          reject({
            success: false,
            error: 'Failed to retrieve booking history',
            code: 'SERVICE_ERROR',
            details: error.message
          });
        }
      }, 400);
    });
  }

  /**
   * Cancels a booking (if allowed)
   * @param {string} bookingId - Booking ID to cancel
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Promise resolving to cancellation status
   */
  static async cancelBooking(bookingId, reason = '') {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const booking = bookingStorage.find(b => b.id === bookingId);
          if (!booking) {
            reject({
              success: false,
              error: 'Booking not found',
              code: 'BOOKING_NOT_FOUND'
            });
            return;
          }

          if (booking.status !== 'confirmed') {
            reject({
              success: false,
              error: 'Can only cancel confirmed bookings',
              code: 'INVALID_STATUS'
            });
            return;
          }

          // Check if cancellation is allowed (e.g., not too close to scheduled time)
          const scheduledDateTime = new Date(`${booking.scheduledDate}T08:00:00`);
          const now = new Date();
          const hoursUntilCollection = (scheduledDateTime - now) / (1000 * 60 * 60);

          if (hoursUntilCollection < 24) {
            reject({
              success: false,
              error: 'Cannot cancel booking less than 24 hours before scheduled collection',
              code: 'CANCELLATION_TOO_LATE'
            });
            return;
          }

          // Update booking status
          booking.status = 'cancelled';
          booking.cancelledAt = new Date().toISOString();
          booking.cancellationReason = reason;

          console.log('❌ BOOKING CANCELLED:', {
            bookingId: booking.id,
            reason: reason || 'No reason provided',
            timestamp: booking.cancelledAt
          });

          resolve({
            success: true,
            data: {
              booking: booking,
              message: 'Booking cancelled successfully',
              refundInfo: 'Refund will be processed within 3-5 business days'
            }
          });
        } catch (error) {
          reject({
            success: false,
            error: 'Failed to cancel booking',
            code: 'CANCELLATION_ERROR',
            details: error.message
          });
        }
      }, 600);
    });
  }

  // Private helper methods

  /**
   * Calculates estimated completion time for a booking
   * @private
   */
  static _calculateEstimatedCompletion(date, timeSlotId) {
    const slot = timeSlots.find(s => s.id === timeSlotId);
    if (!slot) return null;

    const [startHour] = slot.startTime.split(':');
    const estimatedTime = new Date(`${date}T${slot.startTime}:00`);
    estimatedTime.setHours(estimatedTime.getHours() + 2); // Assume 2 hours for completion

    return estimatedTime.toISOString();
  }

  /**
   * Calculates average rating from all feedback
   * @private
   */
  static _calculateAverageRating() {
    if (feedbackStorage.length === 0) return 0;
    
    const totalRating = feedbackStorage.reduce((sum, feedback) => sum + feedback.rating, 0);
    return Math.round((totalRating / feedbackStorage.length) * 10) / 10; // Round to 1 decimal
  }
}

export default SchedulingService;
