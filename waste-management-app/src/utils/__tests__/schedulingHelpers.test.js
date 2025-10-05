/**
 * Unit Tests for Scheduling Helper Utilities
 * Tests for date validation, fee calculations, and other utility functions
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module SchedulingHelpersTests
 */

import {
  DateUtils,
  FeeCalculator,
  ValidationUtils,
  generateBookingId,
  generateFeedbackId,
  formatCurrency,
  estimateBinWeight,
  needsAutoPickup,
  getNextAvailableDate
} from '../schedulingHelpers';

import { billingModels, wasteTypes, mockBins } from '../../api/mockData';

describe('SchedulingHelpers', () => {
  
  describe('DateUtils', () => {
    describe('validateScheduleDate', () => {
      test('should validate future weekday as available', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5); // 5 days in future
        
        // Ensure it's a weekday
        while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
          futureDate.setDate(futureDate.getDate() + 1);
        }
        
        const result = DateUtils.validateScheduleDate(futureDate);
        expect(result.isValid).toBe(true);
        expect(result.reason).toBeNull();
      });

      test('should reject past dates', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        
        const result = DateUtils.validateScheduleDate(pastDate);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('Cannot schedule collection for past dates');
      });

      test('should reject weekend dates', () => {
        const sunday = new Date();
        sunday.setDate(sunday.getDate() + (7 - sunday.getDay())); // Next Sunday
        
        const result = DateUtils.validateScheduleDate(sunday);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('Collection not available on weekends');
      });

      test('should reject dates too far in advance', () => {
        const farFutureDate = new Date();
        farFutureDate.setDate(farFutureDate.getDate() + 35); // 35 days ahead
        
        const result = DateUtils.validateScheduleDate(farFutureDate);
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('Cannot schedule more than');
      });

      test('should reject dates within minimum advance time', () => {
        const tooSoonDate = new Date();
        tooSoonDate.setHours(tooSoonDate.getHours() + 12); // 12 hours ahead (less than 24)
        
        const result = DateUtils.validateScheduleDate(tooSoonDate);
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('Must schedule at least');
      });

      test('should handle string date input', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 3);
        const dateString = futureDate.toISOString().split('T')[0];
        
        const result = DateUtils.validateScheduleDate(dateString);
        // Result depends on whether it's a weekday or weekend
        expect(typeof result.isValid).toBe('boolean');
      });
    });

    describe('formatDate', () => {
      test('should format date to YYYY-MM-DD', () => {
        const date = new Date('2024-10-15T10:30:00Z');
        const formatted = DateUtils.formatDate(date);
        expect(formatted).toBe('2024-10-15');
      });

      test('should handle different date formats', () => {
        const date = new Date(2024, 9, 15); // Month is 0-indexed
        const formatted = DateUtils.formatDate(date);
        expect(formatted).toBe('2024-10-15');
      });
    });

    describe('formatDisplayDate', () => {
      test('should format date for display (DD/MM/YYYY)', () => {
        const date = new Date('2024-10-15');
        const formatted = DateUtils.formatDisplayDate(date);
        expect(formatted).toBe('15/10/2024');
      });

      test('should handle string input', () => {
        const formatted = DateUtils.formatDisplayDate('2024-12-25');
        expect(formatted).toBe('25/12/2024');
      });
    });

    describe('getAvailableDates', () => {
      test('should return array of available dates', () => {
        const availableDates = DateUtils.getAvailableDates();
        
        expect(Array.isArray(availableDates)).toBe(true);
        expect(availableDates.length).toBeGreaterThan(0);
        
        availableDates.forEach(dateObj => {
          expect(dateObj.date).toBeDefined();
          expect(dateObj.displayDate).toBeDefined();
          expect(dateObj.dayName).toBeDefined();
          expect(typeof dateObj.date).toBe('string');
          expect(typeof dateObj.displayDate).toBe('string');
          expect(typeof dateObj.dayName).toBe('string');
        });
      });

      test('should only include valid dates', () => {
        const availableDates = DateUtils.getAvailableDates();
        
        availableDates.forEach(dateObj => {
          const validation = DateUtils.validateScheduleDate(dateObj.date);
          expect(validation.isValid).toBe(true);
        });
      });
    });
  });

  describe('FeeCalculator', () => {
    describe('calculateTotalFee', () => {
      test('should calculate flat rate fee correctly', () => {
        const result = FeeCalculator.calculateTotalFee('flat', 'regular', 2, 0);
        
        expect(result.model).toBe('flat');
        expect(result.baseFee).toBeGreaterThan(0);
        expect(result.binFee).toBeGreaterThan(0); // For 2 bins
        expect(result.subtotal).toBeGreaterThan(0);
        expect(result.tax).toBeGreaterThan(0);
        expect(result.total).toBe(result.subtotal + result.tax);
      });

      test('should calculate weight-based fee correctly', () => {
        const result = FeeCalculator.calculateTotalFee('weightBased', 'organic', 1, 10);
        
        expect(result.model).toBe('weightBased');
        expect(result.baseFee).toBeGreaterThan(0);
        expect(result.weightFee).toBeGreaterThan(0);
        expect(result.subtotal).toBeGreaterThan(0);
        expect(result.total).toBeGreaterThan(result.subtotal);
      });

      test('should calculate hybrid fee correctly', () => {
        const result = FeeCalculator.calculateTotalFee('hybrid', 'bulky', 3, 15);
        
        expect(result.model).toBe('hybrid');
        expect(result.baseFee).toBeGreaterThan(0);
        expect(result.binFee).toBeGreaterThan(0);
        expect(result.weightFee).toBeGreaterThan(0); // Weight > threshold
        expect(result.total).toBeGreaterThan(result.subtotal);
      });

      test('should throw error for invalid billing model', () => {
        expect(() => {
          FeeCalculator.calculateTotalFee('invalid', 'regular', 1, 0);
        }).toThrow('Invalid billing model or waste type');
      });

      test('should throw error for invalid waste type', () => {
        expect(() => {
          FeeCalculator.calculateTotalFee('flat', 'invalid', 1, 0);
        }).toThrow('Invalid billing model or waste type');
      });
    });

    describe('calculateFlatFee', () => {
      test('should calculate flat fee for single bin', () => {
        const model = billingModels.flat;
        const wasteType = wasteTypes.find(w => w.id === 'regular');
        
        const result = FeeCalculator.calculateFlatFee(model, wasteType, 1);
        
        expect(result.baseFee).toBe(wasteType.baseFee);
        expect(result.binFee).toBe(0); // No additional bin fee for single bin
        expect(result.weightFee).toBe(0);
        expect(result.subtotal).toBe(wasteType.baseFee);
      });

      test('should calculate flat fee for multiple bins', () => {
        const model = billingModels.flat;
        const wasteType = wasteTypes.find(w => w.id === 'regular');
        
        const result = FeeCalculator.calculateFlatFee(model, wasteType, 3);
        
        expect(result.baseFee).toBe(wasteType.baseFee);
        expect(result.binFee).toBe(2 * model.perBinCharge); // 2 additional bins
        expect(result.subtotal).toBe(wasteType.baseFee + (2 * model.perBinCharge));
      });
    });

    describe('calculateWeightBasedFee', () => {
      test('should calculate weight-based fee', () => {
        const model = billingModels.weightBased;
        const wasteType = wasteTypes.find(w => w.id === 'organic');
        const weight = 20;
        
        const result = FeeCalculator.calculateWeightBasedFee(model, wasteType, weight);
        
        expect(result.baseFee).toBe(model.baseRate);
        expect(result.weightFee).toBe(weight * model.perKgRate * wasteType.weightMultiplier);
        expect(result.subtotal).toBeGreaterThanOrEqual(model.minimumCharge);
      });

      test('should apply minimum charge', () => {
        const model = billingModels.weightBased;
        const wasteType = wasteTypes.find(w => w.id === 'recyclable');
        const weight = 1; // Very low weight
        
        const result = FeeCalculator.calculateWeightBasedFee(model, wasteType, weight);
        
        expect(result.subtotal).toBeGreaterThanOrEqual(model.minimumCharge);
      });
    });

    describe('calculateHybridFee', () => {
      test('should calculate hybrid fee below weight threshold', () => {
        const model = billingModels.hybrid;
        const wasteType = wasteTypes.find(w => w.id === 'regular');
        const weight = 5; // Below threshold
        
        const result = FeeCalculator.calculateHybridFee(model, wasteType, 2, weight);
        
        expect(result.baseFee).toBe(model.baseRate);
        expect(result.binFee).toBe(model.perBinCharge); // 1 additional bin
        expect(result.weightFee).toBe(0); // Below threshold
      });

      test('should calculate hybrid fee above weight threshold', () => {
        const model = billingModels.hybrid;
        const wasteType = wasteTypes.find(w => w.id === 'bulky');
        const weight = 15; // Above threshold
        
        const result = FeeCalculator.calculateHybridFee(model, wasteType, 1, weight);
        
        expect(result.baseFee).toBe(model.baseRate);
        expect(result.binFee).toBe(0); // Single bin
        expect(result.weightFee).toBeGreaterThan(0); // Above threshold
      });
    });
  });

  describe('ValidationUtils', () => {
    describe('validateBookingData', () => {
      const validBookingData = {
        residentId: 'R001',
        binIds: ['BIN001', 'BIN002'],
        wasteType: 'regular',
        scheduledDate: (() => {
          const date = new Date();
          date.setDate(date.getDate() + 5);
          return date.toISOString().split('T')[0];
        })(),
        timeSlot: 'morning'
      };

      test('should validate correct booking data', () => {
        const result = ValidationUtils.validateBookingData(validBookingData);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      test('should reject booking without resident ID', () => {
        const invalidData = { ...validBookingData };
        delete invalidData.residentId;
        
        const result = ValidationUtils.validateBookingData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Resident ID is required');
      });

      test('should reject booking without bins', () => {
        const invalidData = { ...validBookingData, binIds: [] };
        
        const result = ValidationUtils.validateBookingData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('At least one bin must be selected');
      });

      test('should reject booking with too many bins', () => {
        const invalidData = { 
          ...validBookingData, 
          binIds: ['BIN001', 'BIN002', 'BIN003', 'BIN004', 'BIN005', 'BIN006'] 
        };
        
        const result = ValidationUtils.validateBookingData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('Maximum'))).toBe(true);
      });

      test('should reject booking without waste type', () => {
        const invalidData = { ...validBookingData };
        delete invalidData.wasteType;
        
        const result = ValidationUtils.validateBookingData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Waste type is required');
      });

      test('should reject booking with past date', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        const invalidData = { 
          ...validBookingData, 
          scheduledDate: pastDate.toISOString().split('T')[0] 
        };
        
        const result = ValidationUtils.validateBookingData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateFeedbackData', () => {
      const validFeedbackData = {
        bookingId: 'BOOK001',
        rating: 5,
        comment: 'Excellent service!'
      };

      test('should validate correct feedback data', () => {
        const result = ValidationUtils.validateFeedbackData(validFeedbackData);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      test('should validate feedback without comment', () => {
        const dataWithoutComment = { ...validFeedbackData };
        delete dataWithoutComment.comment;
        
        const result = ValidationUtils.validateFeedbackData(dataWithoutComment);
        expect(result.isValid).toBe(true);
      });

      test('should reject feedback without booking ID', () => {
        const invalidData = { ...validFeedbackData };
        delete invalidData.bookingId;
        
        const result = ValidationUtils.validateFeedbackData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Booking ID is required');
      });

      test('should reject feedback with invalid rating', () => {
        const invalidData = { ...validFeedbackData, rating: 6 };
        
        const result = ValidationUtils.validateFeedbackData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Rating must be between 1 and 5');
      });

      test('should reject feedback with rating less than 1', () => {
        const invalidData = { ...validFeedbackData, rating: 0 };
        
        const result = ValidationUtils.validateFeedbackData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Rating must be between 1 and 5');
      });

      test('should reject feedback with too long comment', () => {
        const longComment = 'a'.repeat(501); // 501 characters
        const invalidData = { ...validFeedbackData, comment: longComment };
        
        const result = ValidationUtils.validateFeedbackData(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Comment must be less than 500 characters');
      });
    });
  });

  describe('Utility Functions', () => {
    describe('generateBookingId', () => {
      test('should generate unique booking IDs', () => {
        const id1 = generateBookingId();
        const id2 = generateBookingId();
        
        expect(id1).toMatch(/^BOOK\d+/);
        expect(id2).toMatch(/^BOOK\d+/);
        expect(id1).not.toBe(id2);
      });

      test('should generate IDs with correct format', () => {
        const id = generateBookingId();
        expect(id).toMatch(/^BOOK\d{13,}\d{1,3}$/); // Timestamp + random
      });
    });

    describe('generateFeedbackId', () => {
      test('should generate unique feedback IDs', () => {
        const id1 = generateFeedbackId();
        const id2 = generateFeedbackId();
        
        expect(id1).toMatch(/^FB\d+/);
        expect(id2).toMatch(/^FB\d+/);
        expect(id1).not.toBe(id2);
      });
    });

    describe('formatCurrency', () => {
      test('should format currency with default LKR', () => {
        const formatted = formatCurrency(1500);
        expect(formatted).toBe('LKR 1,500');
      });

      test('should format currency with custom currency', () => {
        const formatted = formatCurrency(2500, 'USD');
        expect(formatted).toBe('USD 2,500');
      });

      test('should handle decimal amounts', () => {
        const formatted = formatCurrency(1234.56);
        expect(formatted).toBe('LKR 1,234.56');
      });

      test('should handle zero amount', () => {
        const formatted = formatCurrency(0);
        expect(formatted).toBe('LKR 0');
      });
    });

    describe('estimateBinWeight', () => {
      test('should estimate weight for general waste bin', () => {
        const bin = {
          type: 'General Waste',
          capacity: 120,
          currentFillLevel: 50 // 50%
        };
        
        const weight = estimateBinWeight(bin);
        expect(weight).toBeGreaterThan(0);
        expect(typeof weight).toBe('number');
      });

      test('should estimate weight for organic waste bin', () => {
        const bin = {
          type: 'Organic',
          capacity: 60,
          currentFillLevel: 80 // 80%
        };
        
        const weight = estimateBinWeight(bin);
        expect(weight).toBeGreaterThan(0);
        // Organic waste should be heavier than general waste
      });

      test('should return zero for empty bin', () => {
        const bin = {
          type: 'Recyclable',
          capacity: 80,
          currentFillLevel: 0
        };
        
        const weight = estimateBinWeight(bin);
        expect(weight).toBe(0);
      });

      test('should handle unknown bin type', () => {
        const bin = {
          type: 'Unknown Type',
          capacity: 100,
          currentFillLevel: 50
        };
        
        const weight = estimateBinWeight(bin);
        expect(weight).toBeGreaterThan(0); // Should use default density
      });
    });

    describe('needsAutoPickup', () => {
      test('should return true for smart bin above threshold', () => {
        const bin = {
          isSmartBin: true,
          sensorEnabled: true,
          autoPickupThreshold: 80,
          currentFillLevel: 85
        };
        
        expect(needsAutoPickup(bin)).toBe(true);
      });

      test('should return false for smart bin below threshold', () => {
        const bin = {
          isSmartBin: true,
          sensorEnabled: true,
          autoPickupThreshold: 80,
          currentFillLevel: 75
        };
        
        expect(needsAutoPickup(bin)).toBe(false);
      });

      test('should return false for non-smart bin', () => {
        const bin = {
          isSmartBin: false,
          sensorEnabled: false,
          autoPickupThreshold: null,
          currentFillLevel: 90
        };
        
        expect(needsAutoPickup(bin)).toBe(false);
      });

      test('should return false for smart bin with disabled sensor', () => {
        const bin = {
          isSmartBin: true,
          sensorEnabled: false,
          autoPickupThreshold: 80,
          currentFillLevel: 90
        };
        
        expect(needsAutoPickup(bin)).toBe(false);
      });
    });

    describe('getNextAvailableDate', () => {
      test('should return next available date string', () => {
        const nextDate = getNextAvailableDate();
        
        if (nextDate) {
          expect(typeof nextDate).toBe('string');
          expect(nextDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          
          // Should be a valid future date
          const date = new Date(nextDate);
          const today = new Date();
          expect(date > today).toBe(true);
        } else {
          // If no available dates, should return null
          expect(nextDate).toBeNull();
        }
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null/undefined inputs gracefully', () => {
      expect(() => DateUtils.formatDate(null)).not.toThrow();
      expect(() => formatCurrency(null)).not.toThrow();
      expect(() => estimateBinWeight(null)).toThrow();
    });

    test('should handle extreme date values', () => {
      const farFuture = new Date('2099-12-31');
      const result = DateUtils.validateScheduleDate(farFuture);
      expect(result.isValid).toBe(false);
    });

    test('should handle extreme weight values in fee calculation', () => {
      const result = FeeCalculator.calculateTotalFee('weightBased', 'regular', 1, 10000);
      expect(result.total).toBeGreaterThan(0);
      expect(isFinite(result.total)).toBe(true);
    });

    test('should handle very large bin counts', () => {
      const result = FeeCalculator.calculateTotalFee('flat', 'regular', 100, 0);
      expect(result.total).toBeGreaterThan(0);
      expect(isFinite(result.total)).toBe(true);
    });
  });
});
