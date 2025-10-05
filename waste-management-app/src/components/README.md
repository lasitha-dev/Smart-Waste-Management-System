# Component Documentation

This directory contains all reusable UI components for the Smart Waste Management System.

## Components Overview

### Core Components

#### BinCard
- **Purpose**: Displays individual waste bin information with interactive selection
- **Features**: Fill level visualization, status indicators, touch feedback
- **Props**: `bin`, `selected`, `onPress`, `disabled`, `showWeight`

#### LoadingIndicator
- **Purpose**: Provides various loading states and animations
- **Types**: Spinner, dots, pulse, skeleton, activity indicator
- **Variants**: `InlineLoader`, `PageLoader`, `SkeletonLoader`

#### Toast
- **Purpose**: Non-intrusive user feedback and notifications
- **Types**: Success, error, warning, info
- **Features**: Auto-dismiss, swipe gestures, action buttons

#### ProgressIndicator
- **Purpose**: Visual progress tracking for multi-step processes
- **Types**: Multi-step, circular, linear progress bars
- **Features**: Step status tracking, animations

#### ErrorBoundary
- **Purpose**: Graceful error handling and recovery
- **Features**: Error logging, fallback UI, reload functionality

### Form Components

#### DateTimePicker
- **Purpose**: Date and time selection for scheduling
- **Features**: Calendar view, time slots, validation
- **Integration**: Works with scheduling flow

#### FeedbackForm
- **Purpose**: Post-collection feedback and ratings
- **Features**: Rating system, categorized feedback, validation

#### FeeDisplay
- **Purpose**: Fee calculation and display
- **Features**: Breakdown display, currency formatting

## Usage Guidelines

### Import Pattern
```javascript
import ComponentName from '../components/ComponentName';
```

### Styling
- Use design tokens from `../constants/`
- Follow common style patterns
- Ensure responsive design

### Testing
- Each component has corresponding test files
- Test user interactions and edge cases
- Maintain good test coverage

## Development Notes

- All components are functional components using hooks
- PropTypes or TypeScript definitions should be added
- Accessibility features are implemented
- Performance optimizations applied where needed
