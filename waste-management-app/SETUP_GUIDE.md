# Payment Module - Setup & Installation Guide

Complete guide to set up and run the Payment & Rewards Management module.

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** (optional but recommended)
- **Git** for version control
- **Code Editor** (VS Code recommended)

### For Mobile Testing

- **Android Studio** (for Android emulator)
- **Xcode** (for iOS simulator - Mac only)
- **Expo Go app** (for physical device testing)

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Smart-Waste-Management-System/waste-management-app
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native
- Expo
- React Navigation
- Testing libraries (Jest, React Native Testing Library)

### 3. Verify Installation

Check that all dependencies are installed correctly:

```bash
npm list --depth=0
```

You should see packages like:
- `expo`
- `react-native`
- `@react-navigation/native`
- `@testing-library/react-native`

---

## Running the Application

### Start Development Server

```bash
npm start
```

This will start the Expo development server and show a QR code.

### Run on Android

```bash
npm run android
```

Or press `a` in the terminal after running `npm start`.

### Run on iOS (Mac only)

```bash
npm run ios
```

Or press `i` in the terminal after running `npm start`.

### Run on Web

```bash
npm run web
```

Or press `w` in the terminal after running `npm start`.

### Run on Physical Device

1. Install **Expo Go** app from Play Store or App Store
2. Run `npm start`
3. Scan the QR code with your device
4. App will load on your device

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage Report

```bash
npm run test:coverage
```

This will generate a coverage report showing:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

### View Coverage Report

After running coverage, open:
```
coverage/lcov-report/index.html
```

---

## Project Structure

```
waste-management-app/
├── src/
│   ├── screens/Payments/        # Payment screens
│   │   ├── PaymentHub.js
│   │   ├── PaymentPage.js
│   │   ├── PaymentConfirmation.js
│   │   ├── PaymentHistory.js
│   │   └── ReceiptViewScreen.js
│   │
│   ├── components/              # Reusable components
│   │   ├── BillSummaryCard.js
│   │   ├── PaymentMethodCard.js
│   │   ├── BalanceSummary.js
│   │   ├── ReceiptView.js
│   │   ├── LoadingIndicator.js
│   │   ├── Toast.js
│   │   └── StatusMessage.js
│   │
│   ├── api/                     # Service layer
│   │   ├── mockData.js
│   │   ├── paymentService.js
│   │   └── __tests__/
│   │
│   ├── utils/                   # Utility functions
│   │   ├── paymentHelpers.js
│   │   ├── dateFormatter.js
│   │   └── __tests__/
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useAsyncState.js
│   │   └── useFormSubmit.js
│   │
│   ├── context/                 # State management
│   │   └── PaymentContext.js
│   │
│   └── constants/               # App constants
│       └── theme.js
│
├── package.json
├── App.js
└── index.js
```

---

## Navigation Setup

To integrate the payment module with your app navigation:

### 1. Create Navigation Stack

```javascript
// navigation/PaymentStack.js
import { createStackNavigator } from '@react-navigation/stack';
import PaymentHub from '../screens/Payments/PaymentHub';
import PaymentPage from '../screens/Payments/PaymentPage';
import PaymentConfirmation from '../screens/Payments/PaymentConfirmation';
import PaymentHistory from '../screens/Payments/PaymentHistory';
import ReceiptViewScreen from '../screens/Payments/ReceiptViewScreen';

const Stack = createStackNavigator();

export default function PaymentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PaymentHub" component={PaymentHub} />
      <Stack.Screen name="PaymentPage" component={PaymentPage} />
      <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmation} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistory} />
      <Stack.Screen name="ReceiptView" component={ReceiptViewScreen} />
    </Stack.Navigator>
  );
}
```

### 2. Wrap App with Context

```javascript
// App.js
import { NavigationContainer } from '@react-navigation/native';
import { PaymentProvider } from './src/context/PaymentContext';
import PaymentStack from './navigation/PaymentStack';

export default function App() {
  return (
    <PaymentProvider>
      <NavigationContainer>
        <PaymentStack />
      </NavigationContainer>
    </PaymentProvider>
  );
}
```

---

## Environment Configuration

### Mock Data Configuration

The module uses mock data by default. To modify:

1. Open `src/api/mockData.js`
2. Edit the mock resident, bills, or payment methods
3. Save and restart the app

### Resident ID

The hardcoded resident ID is `RES001`. To change:

1. Update `RESIDENT_ID` constant in each screen
2. Or create a global config file

---

## Troubleshooting

### Common Issues

#### 1. Metro Bundler Cache Issues

```bash
npm start -- --reset-cache
```

#### 2. Node Modules Issues

```bash
rm -rf node_modules
npm install
```

#### 3. Expo Cache Issues

```bash
expo start -c
```

#### 4. Test Failures

```bash
npm test -- --clearCache
npm test
```

#### 5. Navigation Errors

Ensure React Navigation dependencies are installed:
```bash
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
```

---

## Development Workflow

### 1. Start Development

```bash
npm start
```

### 2. Make Changes

Edit files in `src/` directory. Changes will hot-reload automatically.

### 3. Run Tests

```bash
npm run test:watch
```

Keep tests running in watch mode during development.

### 4. Check Coverage

```bash
npm run test:coverage
```

Ensure coverage stays above 80%.

### 5. Commit Changes

```bash
git add .
git commit -m "Description of changes"
git push
```

---

## Testing Guide

### Unit Testing

Test individual functions and components:

```javascript
// Example test
import { formatCurrency } from '../utils/paymentHelpers';

test('formats currency correctly', () => {
  expect(formatCurrency(1000)).toBe('Rs. 1,000');
});
```

### Component Testing

Test component rendering and interactions:

```javascript
import { render, fireEvent } from '@testing-library/react-native';
import BillSummaryCard from '../components/BillSummaryCard';

test('renders bill information', () => {
  const { getByText } = render(<BillSummaryCard billData={mockBill} />);
  expect(getByText('BILL_2024_102')).toBeTruthy();
});
```

### Integration Testing

Test complete flows:

```javascript
test('complete payment flow', async () => {
  // 1. Initiate session
  const session = await initiatePaymentSession('RES001', 'BILL_2024_102');
  
  // 2. Process payment
  const result = await processPayment(session.sessionId, mockMethod);
  
  // 3. Verify success
  expect(result.success).toBe(true);
});
```

---

## Performance Optimization

### 1. Memoization

Use `React.memo`, `useMemo`, and `useCallback` for expensive operations:

```javascript
const MemoizedComponent = React.memo(BillSummaryCard);

const memoizedValue = useMemo(() => calculateTotal(bills), [bills]);

const handlePress = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### 2. FlatList Optimization

For long lists, use `FlatList` with proper keys:

```javascript
<FlatList
  data={payments}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

### 3. Image Optimization

Use optimized images and lazy loading where applicable.

---

## Debugging

### Enable Debug Mode

1. Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
2. Select "Debug JS Remotely"
3. Open Chrome DevTools

### Console Logging

The app includes console logs for:
- Payment gateway simulation
- Notification sending
- Session management
- Error tracking

### React Native Debugger

Install React Native Debugger for better debugging:

```bash
brew install --cask react-native-debugger
```

---

## Deployment Preparation

### 1. Remove Console Logs

Before production, remove development console logs:

```javascript
// Use a logging utility instead
import { logPayment } from './utils/logger';
```

### 2. Environment Variables

Set up environment-specific configs:

```javascript
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.production.com' 
  : 'http://localhost:3000';
```

### 3. Build for Production

```bash
# Android
expo build:android

# iOS
expo build:ios
```

---

## Support & Resources

### Documentation

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-native-testing-library/intro)

### Community

- [React Native Community](https://reactnative.dev/community/overview)
- [Expo Forums](https://forums.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

### Contact

For module-specific questions:
- **Developer:** Gabilan S (IT22060426)
- **Module:** Payments & Rewards Management

---

## Next Steps

After setup:

1. ✅ Explore the Payment Hub screen
2. ✅ Test the payment flow with mock data
3. ✅ Run the test suite
4. ✅ Review the code structure
5. ✅ Integrate with other modules
6. ✅ Customize for your needs

---

**Happy Coding! 🚀**
