/**
 * Mock data for the Smart Waste Management System - Collection Scheduling Module
 * This file contains all mock data used throughout the scheduling functionality
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module MockData
 */

/**
 * Mock resident data - represents the logged-in user
 * In a real app, this would come from authentication service
 */
export const mockResident = {
  id: 'R001',
  name: 'John Doe',
  email: 'john@email.com',
  address: '123 Main Street, Colombo',
  accountStatus: 'active',
  linkedBins: ['BIN001', 'BIN002', 'BIN003'],
  phone: '+94771234567',
  registrationDate: '2023-01-15',
  billingModel: 'hybrid' // flat, weight-based, or hybrid
};

/**
 * Mock bins data - represents waste bins linked to the resident's account
 * Each bin has different properties and capabilities
 */
export const mockBins = [
  {
    id: 'BIN001',
    type: 'General Waste',
    capacity: 120, // liters
    status: 'Active',
    location: 'Front yard',
    isSmartBin: true,
    currentFillLevel: 45, // percentage
    lastEmptied: '2024-10-01',
    sensorEnabled: true,
    autoPickupThreshold: 80 // percentage
  },
  {
    id: 'BIN002',
    type: 'Recyclable',
    capacity: 80,
    status: 'Active',
    location: 'Back yard',
    isSmartBin: false,
    currentFillLevel: 30,
    lastEmptied: '2024-09-28',
    sensorEnabled: false,
    autoPickupThreshold: null
  },
  {
    id: 'BIN003',
    type: 'Organic',
    capacity: 60,
    status: 'Active',
    location: 'Side yard',
    isSmartBin: true,
    currentFillLevel: 70,
    lastEmptied: '2024-09-30',
    sensorEnabled: true,
    autoPickupThreshold: 75
  },
  {
    id: 'BIN004',
    type: 'General Waste',
    capacity: 120,
    status: 'Inactive',
    location: 'Garage',
    isSmartBin: false,
    currentFillLevel: 0,
    lastEmptied: '2024-08-15',
    sensorEnabled: false,
    autoPickupThreshold: null
  }
];

/**
 * Waste types available for collection with associated fees
 * Fees are in LKR (Sri Lankan Rupees)
 */
export const wasteTypes = [
  {
    id: 'regular',
    label: 'Regular Waste',
    baseFee: 500,
    description: 'Standard household waste',
    weightMultiplier: 1.0,
    icon: '🗑️'
  },
  {
    id: 'bulky',
    label: 'Bulky Items',
    baseFee: 800,
    description: 'Large items, furniture, appliances',
    weightMultiplier: 1.5,
    icon: '📦'
  },
  {
    id: 'recyclable',
    label: 'Recyclables',
    baseFee: 300,
    description: 'Paper, plastic, glass, metal',
    weightMultiplier: 0.8,
    icon: '♻️'
  },
  {
    id: 'organic',
    label: 'Organic Waste',
    baseFee: 400,
    description: 'Food scraps, garden waste',
    weightMultiplier: 0.9,
    icon: '🌱'
  }
];

/**
 * Available time slots for waste collection
 */
export const timeSlots = [
  {
    id: 'morning',
    label: 'Morning (8:00 AM - 12:00 PM)',
    startTime: '08:00',
    endTime: '12:00',
    available: true
  },
  {
    id: 'afternoon',
    label: 'Afternoon (12:00 PM - 4:00 PM)',
    startTime: '12:00',
    endTime: '16:00',
    available: true
  },
  {
    id: 'evening',
    label: 'Evening (4:00 PM - 8:00 PM)',
    startTime: '16:00',
    endTime: '20:00',
    available: true
  }
];

/**
 * Mock unavailable dates (for testing availability checking)
 * In a real app, this would come from the backend
 */
export const unavailableDates = [
  '2024-10-06', // Sunday
  '2024-10-13', // Sunday
  '2024-10-20', // Sunday
  '2024-10-27', // Sunday
  '2024-12-25', // Christmas
  '2024-12-31', // New Year's Eve
];

/**
 * Mock booking history for the resident
 */
export const mockBookingHistory = [
  {
    id: 'BOOK001',
    residentId: 'R001',
    binIds: ['BIN001'],
    wasteType: 'regular',
    scheduledDate: '2024-09-25',
    timeSlot: 'morning',
    status: 'completed',
    totalFee: 500,
    createdAt: '2024-09-20T10:30:00Z',
    completedAt: '2024-09-25T09:15:00Z',
    feedback: {
      rating: 5,
      comment: 'Excellent service, on time pickup',
      submittedAt: '2024-09-25T10:00:00Z'
    }
  },
  {
    id: 'BOOK002',
    residentId: 'R001',
    binIds: ['BIN002', 'BIN003'],
    wasteType: 'recyclable',
    scheduledDate: '2024-10-02',
    timeSlot: 'afternoon',
    status: 'completed',
    totalFee: 600,
    createdAt: '2024-09-28T14:20:00Z',
    completedAt: '2024-10-02T14:30:00Z',
    feedback: null // No feedback provided
  }
];

/**
 * Mock feedback data for analytics
 */
export const mockFeedbackData = [
  {
    id: 'FB001',
    bookingId: 'BOOK001',
    residentId: 'R001',
    rating: 5,
    comment: 'Excellent service, on time pickup',
    submittedAt: '2024-09-25T10:00:00Z',
    category: 'service_quality'
  },
  {
    id: 'FB002',
    bookingId: 'BOOK003',
    residentId: 'R002',
    rating: 4,
    comment: 'Good service but slightly late',
    submittedAt: '2024-09-28T16:30:00Z',
    category: 'timeliness'
  }
];

/**
 * Billing model configurations
 */
export const billingModels = {
  flat: {
    name: 'Flat Rate',
    description: 'Fixed fee per collection regardless of weight',
    baseRate: 500,
    perBinCharge: 100
  },
  weightBased: {
    name: 'Weight-Based',
    description: 'Fee calculated based on actual weight',
    baseRate: 200,
    perKgRate: 50,
    minimumCharge: 300
  },
  hybrid: {
    name: 'Hybrid Model',
    description: 'Combination of flat rate and weight-based pricing',
    baseRate: 300,
    perBinCharge: 50,
    perKgRate: 25,
    weightThreshold: 10 // kg, above this weight-based pricing kicks in
  }
};

/**
 * System configuration constants
 */
export const systemConfig = {
  maxAdvanceBookingDays: 30,
  minAdvanceBookingHours: 24,
  maxBinsPerBooking: 5,
  feedbackTimeoutDays: 7,
  autoPickupEnabled: true,
  notificationEnabled: true
};

/**
 * Mock notification templates
 */
export const notificationTemplates = {
  bookingConfirmation: {
    title: 'Booking Confirmed',
    body: 'Your waste collection has been scheduled for {date} during {timeSlot}.'
  },
  collectionReminder: {
    title: 'Collection Reminder',
    body: 'Your waste collection is scheduled for tomorrow. Please ensure bins are accessible.'
  },
  collectionCompleted: {
    title: 'Collection Completed',
    body: 'Your waste has been collected. Please rate our service.'
  },
  feedbackRequest: {
    title: 'Rate Our Service',
    body: 'How was your waste collection experience? Your feedback helps us improve.'
  }
};
