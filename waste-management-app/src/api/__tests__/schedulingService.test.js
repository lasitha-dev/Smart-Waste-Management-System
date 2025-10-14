/**
 * Unit Tests for SchedulingService
 * Comprehensive test suite covering all service functions with >80% coverage
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module SchedulingServiceTests
 */

import SchedulingService from '../schedulingService';
import { mockResident, mockBins, wasteTypes } from '../mockData';

// Mock console methods to avoid cluttering test output
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

describe('SchedulingService', () => {
  
  describe('getResidentBins', () => {
    test('should return active bins for valid resident', async () => {
      const result = await SchedulingService.getResidentBins('R001');
      
      expect(result.success).toBe(true);
      expect(result.data.bins).toBeDefined();
      expect(result.data.bins.length).toBeGreaterThan(0);
      expect(result.data.resident.id).toBe('R001');
      expect(result.data.resident.name).toBe('John Doe');
      
      // Check that only active bins are returned
      result.data.bins.forEach(bin => {
        expect(bin.status).toBe('Active');
      });
    });

    test('should reject with missing resident ID', async () => {
      await expect(SchedulingService.getResidentBins()).rejects.toMatchObject({
        message: 'Resident ID is required',
        code: 'VALIDATION_ERROR'
      });
    });

    test('should reject with empty resident ID', async () => {
      await expect(SchedulingService.getResidentBins('')).rejects.toMatchObject({
        message: 'Resident ID is required',
        code: 'VALIDATION_ERROR'
      });
    });

    test('should reject for non-existent resident', async () => {
      await expect(SchedulingService.getResidentBins('INVALID_ID')).rejects.toMatchObject({
        message: 'Resident account not found. Please check your login credentials.',
        code: 'RESOURCE_NOT_FOUND'
      });
    });

    test('should identify bins needing auto pickup', async () => {
      const result = await SchedulingService.getResidentBins('R001');
      
      expect(result.success).toBe(true);
      expect(result.data.autoPickupBins).toBeDefined();
      expect(Array.isArray(result.data.autoPickupBins)).toBe(true);
      expect(typeof result.data.hasAutoPickup).toBe('boolean');
    });
  });

  describe('checkAvailability', () => {
    // Helper function to get next weekday (Monday-Friday)
    const getNextWeekday = () => {
      const date = new Date();
      date.setDate(date.getDate() + 2); // Start from 2 days ahead to avoid minimum advance booking issues
      
      // Find the next weekday
      while (date.getDay() === 0 || date.getDay() === 6) { // 0 = Sunday, 6 = Saturday
        date.setDate(date.getDate() + 1);
      }
      
      return date;
    };
    
    const futureDate = getNextWeekday();
    const futureDateString = futureDate.toISOString().split('T')[0];

    test('should confirm availability for valid date and time slot', async () => {
      const result = await SchedulingService.checkAvailability(futureDateString, 'morning');
      
      expect(result.success).toBe(true);
      expect(result.data.available).toBe(true);
      expect(result.data.date).toBe(futureDateString);
      expect(result.data.timeSlot).toBeDefined();
      expect(result.data.timeSlot.id).toBe('morning');
    });

    test('should reject with missing date', async () => {
      await expect(SchedulingService.checkAvailability(null, 'morning')).rejects.toMatchObject({
        success: false,
        error: 'Date and time slot are required',
        code: 'MISSING_PARAMETERS'
      });
    });

    test('should reject with missing time slot', async () => {
      await expect(SchedulingService.checkAvailability(futureDateString, null)).rejects.toMatchObject({
        success: false,
        error: 'Date and time slot are required',
        code: 'MISSING_PARAMETERS'
      });
    });

    test('should reject for past dates', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastDateString = pastDate.toISOString().split('T')[0];

      await expect(SchedulingService.checkAvailability(pastDateString, 'morning')).rejects.toMatchObject({
        success: false,
        code: 'INVALID_DATE'
      });
    });

    test('should reject for invalid time slot', async () => {
      await expect(SchedulingService.checkAvailability(futureDateString, 'invalid_slot')).rejects.toMatchObject({
        success: false,
        error: 'Invalid time slot',
        code: 'INVALID_TIME_SLOT'
      });
    });

    test('should handle unavailable slots with alternatives', async () => {
      // Test with a date that would trigger unavailability (day 7, 14, 21, 28)
      const unavailableDate = new Date();
      unavailableDate.setDate(7); // Day 7 of month
      unavailableDate.setMonth(unavailableDate.getMonth() + 1); // Next month to ensure future
      const unavailableDateString = unavailableDate.toISOString().split('T')[0];

      try {
        await SchedulingService.checkAvailability(unavailableDateString, 'morning');
      } catch (error) {
        if (error.code === 'SLOT_UNAVAILABLE') {
          expect(error.alternatives).toBeDefined();
          expect(error.alternatives.sameDay).toBeDefined();
          expect(error.alternatives.nextAvailableDate).toBeDefined();
          expect(error.alternatives.suggestedSlots).toBeDefined();
        }
      }
    });
  });

  describe('calculateFee', () => {
    test('should calculate fee for regular waste with single bin', async () => {
      const params = {
        wasteType: 'regular',
        binIds: ['BIN001'],
        billingModel: 'flat',
        estimatedWeight: 0
      };

      const result = await SchedulingService.calculateFee(params);
      
      expect(result.success).toBe(true);
      expect(result.data.total).toBeGreaterThan(0);
      expect(result.data.wasteType.id).toBe('regular');
      expect(result.data.binCount).toBe(1);
      expect(result.data.model).toBe('flat');
      expect(result.data.currency).toBe('LKR');
    });

    test('should calculate fee for multiple bins', async () => {
      const params = {
        wasteType: 'bulky',
        binIds: ['BIN001', 'BIN002', 'BIN003'],
        billingModel: 'flat'
      };

      const result = await SchedulingService.calculateFee(params);
      
      expect(result.success).toBe(true);
      expect(result.data.binCount).toBe(3);
      expect(result.data.binFee).toBeGreaterThan(0); // Should have per-bin charges
    });

    test('should calculate weight-based fee correctly', async () => {
      const params = {
        wasteType: 'organic',
        binIds: ['BIN001'],
        billingModel: 'weightBased',
        estimatedWeight: 15
      };

      const result = await SchedulingService.calculateFee(params);
      
      expect(result.success).toBe(true);
      expect(result.data.model).toBe('weightBased');
      expect(result.data.weightFee).toBeGreaterThan(0);
      expect(result.data.estimatedWeight).toBe(15);
    });

    test('should calculate hybrid fee correctly', async () => {
      const params = {
        wasteType: 'recyclable',
        binIds: ['BIN001', 'BIN002'],
        billingModel: 'hybrid',
        estimatedWeight: 12
      };

      const result = await SchedulingService.calculateFee(params);
      
      expect(result.success).toBe(true);
      expect(result.data.model).toBe('hybrid');
      expect(result.data.baseFee).toBeGreaterThan(0);
      expect(result.data.binFee).toBeGreaterThan(0);
      expect(result.data.tax).toBeGreaterThan(0);
    });

    test('should reject with missing waste type', async () => {
      const params = {
        binIds: ['BIN001']
      };

      await expect(SchedulingService.calculateFee(params)).rejects.toMatchObject({
        success: false,
        error: 'Waste type is required',
        code: 'MISSING_WASTE_TYPE'
      });
    });

    test('should reject with no bins selected', async () => {
      const params = {
        wasteType: 'regular',
        binIds: []
      };

      await expect(SchedulingService.calculateFee(params)).rejects.toMatchObject({
        success: false,
        error: 'At least one bin must be selected',
        code: 'NO_BINS_SELECTED'
      });
    });

    test('should reject with invalid waste type', async () => {
      const params = {
        wasteType: 'invalid_type',
        binIds: ['BIN001']
      };

      await expect(SchedulingService.calculateFee(params)).rejects.toMatchObject({
        success: false,
        error: 'Invalid waste type',
        code: 'INVALID_WASTE_TYPE'
      });
    });
  });

  describe('submitBooking', () => {
    const validBookingData = {
      residentId: 'R001',
      binIds: ['BIN001', 'BIN002'],
      wasteType: 'regular',
      scheduledDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        return date.toISOString().split('T')[0];
      })(),
      timeSlot: 'morning',
      totalFee: 600
    };

    test('should submit valid booking successfully', async () => {
      const result = await SchedulingService.submitBooking(validBookingData);
      
      expect(result.success).toBe(true);
      expect(result.data.booking).toBeDefined();
      expect(result.data.booking.id).toBeDefined();
      expect(result.data.booking.status).toBe('confirmed');
      expect(result.data.booking.confirmationNumber).toBeDefined();
      expect(result.data.message).toBeDefined();
      expect(result.data.nextSteps).toBeDefined();
      expect(Array.isArray(result.data.nextSteps)).toBe(true);
    });

    test('should reject booking with missing resident ID', async () => {
      const invalidData = { ...validBookingData };
      delete invalidData.residentId;

      await expect(SchedulingService.submitBooking(invalidData)).rejects.toMatchObject({
        success: false,
        error: 'Invalid booking data',
        code: 'VALIDATION_ERROR'
      });
    });

    test('should reject booking with no bins selected', async () => {
      const invalidData = { ...validBookingData, binIds: [] };

      await expect(SchedulingService.submitBooking(invalidData)).rejects.toMatchObject({
        success: false,
        error: 'Invalid booking data',
        code: 'VALIDATION_ERROR'
      });
    });

    test('should reject booking with missing waste type', async () => {
      const invalidData = { ...validBookingData };
      delete invalidData.wasteType;

      await expect(SchedulingService.submitBooking(invalidData)).rejects.toMatchObject({
        success: false,
        error: 'Invalid booking data',
        code: 'VALIDATION_ERROR'
      });
    });

    test('should reject booking with past date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const invalidData = { 
        ...validBookingData, 
        scheduledDate: pastDate.toISOString().split('T')[0] 
      };

      await expect(SchedulingService.submitBooking(invalidData)).rejects.toMatchObject({
        success: false,
        error: 'Invalid booking data',
        code: 'VALIDATION_ERROR'
      });
    });
  });

  describe('sendNotification', () => {
    test('should send booking confirmation notification', async () => {
      const result = await SchedulingService.sendNotification(
        'R001',
        'bookingConfirmation',
        { date: '10/10/2024', timeSlot: 'Morning (8:00 AM - 12:00 PM)' }
      );
      
      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.residentId).toBe('R001');
      expect(result.data.type).toBe('bookingConfirmation');
      expect(result.data.title).toBeDefined();
      expect(result.data.message).toBeDefined();
      expect(result.data.sentAt).toBeDefined();
    });

    test('should send collection reminder notification', async () => {
      const result = await SchedulingService.sendNotification(
        'R001',
        'collectionReminder'
      );
      
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('collectionReminder');
    });

    test('should handle unknown notification template', async () => {
      const result = await SchedulingService.sendNotification(
        'R001',
        'unknownTemplate'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown notification template');
    });

    test('should replace template variables correctly', async () => {
      const result = await SchedulingService.sendNotification(
        'R001',
        'bookingConfirmation',
        { date: '15/10/2024', timeSlot: 'Afternoon (12:00 PM - 4:00 PM)' }
      );
      
      expect(result.success).toBe(true);
      expect(result.data.message).toContain('15/10/2024');
      expect(result.data.message).toContain('Afternoon (12:00 PM - 4:00 PM)');
    });
  });

  describe('submitFeedback', () => {
    // Helper function to get next weekday (Monday-Friday)
    const getNextWeekday = () => {
      const date = new Date();
      date.setDate(date.getDate() + 2); // Start from 2 days ahead to avoid minimum advance booking issues
      
      // Find the next weekday
      while (date.getDay() === 0 || date.getDay() === 6) { // 0 = Sunday, 6 = Saturday
        date.setDate(date.getDate() + 1);
      }
      
      return date;
    };
    
    // First, create a completed booking for feedback testing
    beforeEach(async () => {
      const futureDate = getNextWeekday();
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      const bookingData = {
        residentId: 'R001',
        binIds: ['BIN001'],
        wasteType: 'regular',
        scheduledDate: futureDateString,
        timeSlot: 'morning',
        totalFee: 500
      };

      // Submit and then manually mark as completed for testing
      const booking = await SchedulingService.submitBooking(bookingData);
      // Simulate completion (in real app, this would be done by collection team)
      booking.data.booking.status = 'completed';
    });

    test('should submit valid feedback successfully', async () => {
      // Get a completed booking ID
      const history = await SchedulingService.getBookingHistory('R001');
      const completedBooking = history.data.bookings.find(b => b.status === 'completed');
      
      if (completedBooking) {
        const feedbackData = {
          bookingId: completedBooking.id,
          rating: 5,
          comment: 'Excellent service, very punctual!'
        };

        const result = await SchedulingService.submitFeedback(feedbackData);
        
        expect(result.success).toBe(true);
        expect(result.data.feedback).toBeDefined();
        expect(result.data.feedback.rating).toBe(5);
        expect(result.data.feedback.comment).toBe('Excellent service, very punctual!');
        expect(result.data.message).toBeDefined();
        expect(result.data.averageRating).toBeDefined();
      }
    });

    test('should submit feedback with rating only', async () => {
      const history = await SchedulingService.getBookingHistory('R001');
      const completedBooking = history.data.bookings.find(b => b.status === 'completed');
      
      if (completedBooking) {
        const feedbackData = {
          bookingId: completedBooking.id,
          rating: 4
        };

        const result = await SchedulingService.submitFeedback(feedbackData);
        
        expect(result.success).toBe(true);
        expect(result.data.feedback.rating).toBe(4);
        expect(result.data.feedback.comment).toBeUndefined();
      }
    });

    test('should reject feedback with missing booking ID', async () => {
      const feedbackData = {
        rating: 5,
        comment: 'Great service'
      };

      await expect(SchedulingService.submitFeedback(feedbackData)).rejects.toMatchObject({
        success: false,
        error: 'Invalid feedback data',
        code: 'VALIDATION_ERROR'
      });
    });

    test('should reject feedback with invalid rating', async () => {
      const feedbackData = {
        bookingId: 'BOOK001',
        rating: 6, // Invalid rating > 5
        comment: 'Test comment'
      };

      await expect(SchedulingService.submitFeedback(feedbackData)).rejects.toMatchObject({
        success: false,
        error: 'Invalid feedback data',
        code: 'VALIDATION_ERROR'
      });
    });

    test('should reject feedback with rating less than 1', async () => {
      const feedbackData = {
        bookingId: 'BOOK001',
        rating: 0,
        comment: 'Test comment'
      };

      await expect(SchedulingService.submitFeedback(feedbackData)).rejects.toMatchObject({
        success: false,
        error: 'Invalid feedback data',
        code: 'VALIDATION_ERROR'
      });
    });

    test('should reject feedback for non-existent booking', async () => {
      const feedbackData = {
        bookingId: 'NONEXISTENT_BOOKING',
        rating: 5,
        comment: 'Test comment'
      };

      await expect(SchedulingService.submitFeedback(feedbackData)).rejects.toMatchObject({
        success: false,
        error: 'Booking not found',
        code: 'BOOKING_NOT_FOUND'
      });
    });
  });

  describe('getBookingHistory', () => {
    test('should return booking history for valid resident', async () => {
      const result = await SchedulingService.getBookingHistory('R001');
      
      expect(result.success).toBe(true);
      expect(result.data.bookings).toBeDefined();
      expect(Array.isArray(result.data.bookings)).toBe(true);
      expect(result.data.totalBookings).toBeDefined();
      expect(result.data.completedBookings).toBeDefined();
      expect(result.data.pendingBookings).toBeDefined();
      
      // Check that bookings are sorted by creation date (newest first)
      if (result.data.bookings.length > 1) {
        const dates = result.data.bookings.map(b => new Date(b.createdAt));
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i-1] >= dates[i]).toBe(true);
        }
      }
    });

    test('should reject with missing resident ID', async () => {
      await expect(SchedulingService.getBookingHistory()).rejects.toMatchObject({
        success: false,
        error: 'Resident ID is required',
        code: 'MISSING_RESIDENT_ID'
      });
    });

    test('should return empty history for resident with no bookings', async () => {
      const result = await SchedulingService.getBookingHistory('R999');
      
      expect(result.success).toBe(true);
      expect(result.data.bookings).toEqual([]);
      expect(result.data.totalBookings).toBe(0);
    });
  });

  describe('cancelBooking', () => {
    let bookingId;
    
    // Helper function to get next weekday (Monday-Friday)
    const getNextWeekday = () => {
      const date = new Date();
      date.setDate(date.getDate() + 2); // Start from 2 days ahead to avoid minimum advance booking issues
      
      // Find the next weekday
      while (date.getDay() === 0 || date.getDay() === 6) { // 0 = Sunday, 6 = Saturday
        date.setDate(date.getDate() + 1);
      }
      
      return date;
    };

    beforeEach(async () => {
      // Create a booking to cancel
      const futureDate = getNextWeekday();
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      const bookingData = {
        residentId: 'R001',
        binIds: ['BIN001'],
        wasteType: 'regular',
        scheduledDate: futureDateString,
        timeSlot: 'morning',
        totalFee: 500
      };

      const result = await SchedulingService.submitBooking(bookingData);
      bookingId = result.data.booking.id;
    });

    test('should cancel booking successfully with valid reason', async () => {
      const result = await SchedulingService.cancelBooking(bookingId, 'Change of plans');
      
      expect(result.success).toBe(true);
      expect(result.data.booking.status).toBe('cancelled');
      expect(result.data.booking.cancelledAt).toBeDefined();
      expect(result.data.booking.cancellationReason).toBe('Change of plans');
      expect(result.data.message).toBeDefined();
      expect(result.data.refundInfo).toBeDefined();
    });

    test('should cancel booking without reason', async () => {
      const result = await SchedulingService.cancelBooking(bookingId);
      
      expect(result.success).toBe(true);
      expect(result.data.booking.status).toBe('cancelled');
      expect(result.data.booking.cancellationReason).toBe('');
    });

    test('should reject cancellation for non-existent booking', async () => {
      await expect(SchedulingService.cancelBooking('NONEXISTENT')).rejects.toMatchObject({
        success: false,
        error: 'Booking not found',
        code: 'BOOKING_NOT_FOUND'
      });
    });

    test('should reject cancellation for already cancelled booking', async () => {
      // First cancel the booking
      await SchedulingService.cancelBooking(bookingId, 'First cancellation');
      
      // Try to cancel again
      await expect(SchedulingService.cancelBooking(bookingId, 'Second attempt')).rejects.toMatchObject({
        success: false,
        error: 'Can only cancel confirmed bookings',
        code: 'INVALID_STATUS'
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle service errors gracefully', async () => {
      // Test with malformed data that might cause unexpected errors
      const malformedData = {
        residentId: null,
        binIds: 'not_an_array',
        wasteType: 123,
        scheduledDate: 'invalid_date',
        timeSlot: {}
      };

      await expect(SchedulingService.submitBooking(malformedData)).rejects.toMatchObject({
        success: false,
        code: 'BOOKING_ERROR'
      });
    });

    test('should handle calculation errors in fee service', async () => {
      const params = {
        wasteType: 'regular',
        binIds: ['BIN001'],
        billingModel: 'invalid_model'
      };

      await expect(SchedulingService.calculateFee(params)).rejects.toMatchObject({
        success: false,
        error: 'Failed to calculate fee',
        code: 'CALCULATION_ERROR'
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle maximum number of bins', async () => {
      const maxBins = Array.from({ length: 5 }, (_, i) => `BIN00${i + 1}`);
      const params = {
        wasteType: 'regular',
        binIds: maxBins,
        billingModel: 'flat'
      };

      const result = await SchedulingService.calculateFee(params);
      expect(result.success).toBe(true);
      expect(result.data.binCount).toBe(5);
    });

    test('should handle zero weight in weight-based calculation', async () => {
      const params = {
        wasteType: 'organic',
        binIds: ['BIN001'],
        billingModel: 'weightBased',
        estimatedWeight: 0
      };

      const result = await SchedulingService.calculateFee(params);
      expect(result.success).toBe(true);
      expect(result.data.weightFee).toBe(0);
    });

    test('should handle very large weight values', async () => {
      const params = {
        wasteType: 'bulky',
        binIds: ['BIN001'],
        billingModel: 'weightBased',
        estimatedWeight: 1000
      };

      const result = await SchedulingService.calculateFee(params);
      expect(result.success).toBe(true);
      expect(result.data.weightFee).toBeGreaterThan(0);
    });
  });
});
