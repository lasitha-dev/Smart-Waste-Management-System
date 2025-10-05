# Screen Documentation

This directory contains all screen components organized by feature areas.

## Screen Structure

### Main Screens

#### HomeScreen
- **Purpose**: Main dashboard showing bins overview, upcoming collections, quick actions
- **Features**: 
  - Welcome section with user greeting
  - Urgent pickup alerts
  - Quick action grid (Schedule, History, Payments, Support)
  - Bins overview with fill levels
  - Upcoming bookings list
- **Navigation**: Root tab screen
- **State**: Uses local state for dashboard data loading

#### BookingHistoryScreen
- **Purpose**: Display past and upcoming waste collection bookings
- **Features**: Booking status tracking, detailed view, feedback integration
- **Navigation**: Tab screen accessible from home
- **Data**: Fetches booking history from SchedulingService

#### ProfileScreen
- **Purpose**: User profile management and account settings
- **Features**: Personal information, preferences, account settings
- **Navigation**: Tab screen
- **Integration**: User context for profile data

### Scheduling Flow

The scheduling feature is implemented as a multi-step wizard:

#### 1. SchedulePickup
- **Purpose**: Bin selection for waste collection
- **Features**:
  - Load and display resident bins
  - Smart bin auto-selection for urgent pickups
  - Multiple bin selection (max 5)
  - Status filtering and validation
  - Pull-to-refresh functionality
- **Navigation**: Entry point for scheduling flow
- **State Management**: Complex state with async loading

#### 2. SelectDateTime
- **Purpose**: Date, time, and waste type selection
- **Features**:
  - Calendar date picker with availability checking
  - Time slot selection based on availability
  - Waste type categorization
  - Fee calculation preview
  - Business rule validation
- **Navigation**: Second step in scheduling flow
- **Dependencies**: Receives selected bins from previous step

#### 3. ConfirmBooking
- **Purpose**: Final booking confirmation and submission
- **Features**:
  - Booking summary display
  - Fee breakdown
  - Special instructions input
  - Terms acceptance
  - Final submission with error handling
- **Navigation**: Final step in scheduling flow
- **Integration**: Creates booking via SchedulingService

#### 4. ProvideFeedback
- **Purpose**: Post-collection feedback submission
- **Features**:
  - Star rating system
  - Categorized feedback options
  - Comment input
  - Issue reporting
  - Photo attachment (future)
- **Navigation**: Accessible post-collection or via modal
- **Data**: Links to completed bookings

## Screen Development Patterns

### Common Structure
```javascript
const ScreenName = ({ navigation, route }) => {
  // 1. State management
  const [localState, setLocalState] = useState();
  
  // 2. Custom hooks
  const { loading, error, execute } = useAsyncState();
  
  // 3. Effects
  useEffect(() => {
    // Screen initialization
  }, []);
  
  // 4. Event handlers
  const handleAction = () => {
    // Action logic
  };
  
  // 5. Render helpers
  const renderSection = () => {
    // Section rendering
  };
  
  // 6. Main render
  return (
    <ScreenErrorBoundary screenName="ScreenName">
      <SafeAreaView style={styles.container}>
        {/* Screen content */}
      </SafeAreaView>
    </ScreenErrorBoundary>
  );
};
```

### Error Handling
- All screens wrapped in ScreenErrorBoundary
- Graceful error states with retry options
- Toast notifications for user feedback
- Proper loading states during async operations

### Navigation Integration
- Uses React Navigation stack and tab navigators
- Proper parameter passing between screens
- Back button handling and gesture support
- Deep linking support (planned)

### State Management
- Local state for screen-specific data
- Custom hooks for reusable logic
- Context integration for global state
- Async state management patterns

## Testing Strategy

### Screen Testing
- Integration tests for complete user flows
- Navigation testing
- Error state testing
- Loading state verification
- User interaction testing

### Test Files Location
- `__tests__/` directory in each screen folder
- Naming convention: `ScreenName.test.js`
- Mock data and utilities in shared test utils

## Performance Considerations

### Optimization Techniques
- Lazy loading for heavy screens
- Memoization for expensive calculations
- Proper cleanup in useEffect
- FlatList for large data sets
- Image optimization and caching

### Memory Management
- Proper listener cleanup
- Avoiding memory leaks in async operations
- Efficient state updates
- Component unmounting handling

## Future Enhancements

### Planned Features
- Push notification integration
- Offline mode enhancements
- Advanced analytics screens
- Payment integration screens
- Admin dashboard screens

### Architecture Improvements
- TypeScript migration
- Enhanced error boundaries
- Better state management patterns
- Improved testing coverage

## Development Guidelines

### Best Practices
1. Use functional components with hooks
2. Implement proper error boundaries
3. Add loading states for all async operations
4. Follow consistent naming conventions
5. Write comprehensive tests
6. Document complex business logic
7. Optimize for performance
8. Ensure accessibility compliance

### Code Review Checklist
- [ ] Error handling implemented
- [ ] Loading states present
- [ ] Navigation properly configured
- [ ] Tests written and passing
- [ ] Performance optimized
- [ ] Accessibility features added
- [ ] Documentation updated
