/**
 * API Documentation
 * Complete documentation for all API services and data structures
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module APIDocumentation
 */

# API Documentation - Smart Waste Management System

## Overview

This document provides comprehensive documentation for all API services, data structures, and integration points in the Smart Waste Management System.

## Service Architecture

### SchedulingService

Main service class handling all waste collection scheduling operations.

#### Methods

##### `getResidentBins(residentId)`
Retrieves all bins associated with a resident account.

**Parameters:**
- `residentId` (string): Unique identifier for the resident

**Returns:**
```javascript
{
  success: boolean,
  data: {
    bins: Array<Bin>,
    autoPickupBins: Array<Bin>,
    hasAutoPickup: boolean,
    totalBins: number
  },
  message: string,
  timestamp: string
}
```

**Example:**
```javascript
const result = await SchedulingService.getResidentBins('resident_123');
console.log(result.data.bins); // Array of bin objects
```

##### `createBooking(bookingData)`
Creates a new waste collection booking.

**Parameters:**
```javascript
{
  residentId: string,
  selectedBinIds: Array<string>,
  scheduledDate: string, // ISO date string
  timeSlot: string,
  wasteType: string,
  specialInstructions?: string,
  priorityLevel?: 'normal' | 'high' | 'urgent'
}
```

**Returns:**
```javascript
{
  success: boolean,
  data: {
    booking: Booking,
    estimatedFee: number,
    confirmationCode: string
  },
  message: string
}
```

##### `submitFeedback(feedbackData)`
Submits post-collection feedback and ratings.

**Parameters:**
```javascript
{
  bookingId: string,
  rating: number, // 1-5
  comment?: string,
  categories: Array<string>,
  issues?: Array<string>,
  residentId: string
}
```

## Data Models

### Bin
```javascript
{
  id: string,
  type: 'General' | 'Recycling' | 'Organic' | 'Hazardous',
  location: string,
  currentFillLevel: number, // 0-100
  capacity: number, // in liters
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Full',
  lastEmptied: string, // ISO date
  nextScheduledEmpty?: string,
  sensorId?: string,
  coordinates?: {
    latitude: number,
    longitude: number
  }
}
```

### Booking
```javascript
{
  id: string,
  residentId: string,
  binIds: Array<string>,
  scheduledDate: string,
  timeSlot: string,
  wasteType: string,
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
  createdAt: string,
  updatedAt: string,
  estimatedFee: number,
  actualFee?: number,
  collectorId?: string,
  specialInstructions?: string,
  completedAt?: string
}
```

### Resident
```javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  address: {
    street: string,
    city: string,
    postalCode: string,
    coordinates: {
      latitude: number,
      longitude: number
    }
  },
  accountType: 'residential' | 'commercial',
  subscriptionPlan: string,
  registeredBins: Array<string>,
  preferences: {
    notifications: boolean,
    preferredTimeSlots: Array<string>,
    reminderFrequency: string
  }
}
```

## Error Handling

### Error Types

```javascript
const ErrorTypes = {
  NETWORK_ERROR: 'network_error',
  TIMEOUT_ERROR: 'timeout_error',
  VALIDATION_ERROR: 'validation_error',
  BUSINESS_RULE_ERROR: 'business_rule_error',
  SYSTEM_ERROR: 'system_error',
  AUTHENTICATION_ERROR: 'auth_error',
  AUTHORIZATION_ERROR: 'authorization_error',
  NOT_FOUND_ERROR: 'not_found_error'
};
```

### AppError Class
```javascript
class AppError extends Error {
  constructor(message, code, severity, details = {}) {
    super(message);
    this.code = code;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}
```

### Error Response Format
```javascript
{
  success: false,
  error: {
    code: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: object,
    timestamp: string,
    supportActions?: Array<string>
  }
}
```

## Utility Functions

### DateUtils
Collection of date manipulation utilities for scheduling.

```javascript
// Check if date is available for booking
DateUtils.isDateAvailable(date, timeSlot)

// Get next available date
DateUtils.getNextAvailableDate(fromDate)

// Format date for display
DateUtils.formatDisplayDate(date)

// Calculate business days
DateUtils.addBusinessDays(date, days)
```

### FeeCalculator
Calculates collection fees based on various factors.

```javascript
// Calculate base fee
FeeCalculator.calculateBaseFee(binCount, wasteType)

// Calculate urgency fee
FeeCalculator.calculateUrgencyFee(priorityLevel)

// Calculate total fee
FeeCalculator.calculateTotalFee(booking)
```

### ValidationUtils
Input validation utilities.

```javascript
// Validate booking data
ValidationUtils.validateBookingData(bookingData)

// Validate feedback data
ValidationUtils.validateFeedbackData(feedbackData)

// Validate bin selection
ValidationUtils.validateBinSelection(selectedBins)
```

## Mock Data

### Configuration
Mock data is used for development and testing purposes.

```javascript
// System configuration
const systemConfig = {
  maxBinsPerBooking: 5,
  maxAdvanceBookingDays: 30,
  minAdvanceBookingHours: 24,
  urgentPickupThreshold: 85, // fill level percentage
  businessHours: {
    start: '08:00',
    end: '18:00'
  },
  availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
};
```

### Sample Data
```javascript
// Sample resident
const mockResident = {
  id: 'resident_123',
  name: 'John Smith',
  email: 'john.smith@email.com',
  // ... other properties
};

// Sample bins
const mockBins = [
  {
    id: 'bin_001',
    type: 'General',
    location: 'Front Yard',
    currentFillLevel: 65,
    status: 'Active'
  },
  // ... more bins
];
```

## Integration Points

### External Services

#### IoT Sensor Integration
```javascript
// Sensor data format
{
  sensorId: string,
  binId: string,
  fillLevel: number,
  temperature: number,
  battery: number,
  lastUpdate: string,
  status: 'online' | 'offline' | 'error'
}
```

#### Payment Gateway
```javascript
// Payment request format
{
  bookingId: string,
  amount: number,
  currency: 'LKR',
  paymentMethod: string,
  description: string
}
```

#### Notification Service
```javascript
// Notification types
const NotificationTypes = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  PICKUP_REMINDER: 'pickup_reminder',
  URGENT_PICKUP: 'urgent_pickup',
  COLLECTION_COMPLETED: 'collection_completed',
  SYSTEM_MAINTENANCE: 'system_maintenance'
};
```

## Testing

### Mock Service Implementation
All services include mock implementations for testing and development.

```javascript
// Example mock implementation
class MockSchedulingService {
  static async getResidentBins(residentId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data
    return {
      success: true,
      data: {
        bins: mockBins,
        autoPickupBins: mockBins.filter(needsAutoPickup),
        hasAutoPickup: true,
        totalBins: mockBins.length
      },
      message: 'Bins retrieved successfully'
    };
  }
}
```

### Test Data Generation
Utilities for generating test data.

```javascript
// Generate random bin data
function generateMockBin(overrides = {}) {
  return {
    id: `bin_${Math.random().toString(36).substr(2, 9)}`,
    type: 'General',
    currentFillLevel: Math.floor(Math.random() * 100),
    status: 'Active',
    ...overrides
  };
}
```

## Security Considerations

### Data Validation
- All input data is validated before processing
- Sanitization of user input to prevent injection attacks
- Rate limiting on API endpoints

### Authentication
- JWT token-based authentication (when implemented)
- Secure storage of authentication tokens
- Session management and timeout handling

### Data Privacy
- Personal data encryption
- GDPR compliance measures
- Secure data transmission (HTTPS)

## Performance Optimization

### Caching Strategy
- API response caching
- Image caching
- Offline data storage

### Data Loading
- Lazy loading for large datasets
- Pagination for list views
- Optimistic updates for better UX

## Future Enhancements

### Planned API Additions
- Real-time bin monitoring endpoints
- Route optimization algorithms
- Advanced analytics and reporting
- Integration with smart city platforms

### Version History
- v1.0: Basic scheduling functionality
- v1.1: Enhanced error handling and offline support
- v1.2: Real-time features and push notifications (planned)

---

This documentation is maintained alongside the codebase and updated with each release.
