# Payment Module - Quick Reference Guide

Fast reference for common tasks and code snippets.

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## 📁 Key File Locations

```
src/
├── screens/Payments/
│   ├── PaymentHub.js              # Main entry point
│   ├── PaymentPage.js             # 3-step payment
│   ├── PaymentConfirmation.js     # Success screen
│   ├── PaymentHistory.js          # History list
│   └── ReceiptViewScreen.js       # Receipt display
│
├── api/
│   ├── mockData.js                # Edit mock data here
│   └── paymentService.js          # All business logic
│
└── utils/
    ├── paymentHelpers.js          # Validation functions
    └── dateFormatter.js           # Date utilities
```

---

## 🔧 Common Code Snippets

### Import Payment Service

```javascript
import {
  getResidentSummary,
  getUnpaidBills,
  processPayment,
  getPaymentHistory,
} from '../api/paymentService';
```

### Use Payment Context

```javascript
import { usePayment } from '../context/PaymentContext';

function MyComponent() {
  const { 
    currentSession, 
    selectBill, 
    startPaymentSession 
  } = usePayment();
  
  // Use context values...
}
```

### Format Currency

```javascript
import { formatCurrency } from '../utils/paymentHelpers';

const formatted = formatCurrency(1250); // "Rs. 1,250"
```

### Format Date

```javascript
import { formatTimestamp, getDueDateStatus } from '../utils/dateFormatter';

const date = formatTimestamp(timestamp, 'full');
const status = getDueDateStatus(dueDate); // "Due in 3 days"
```

### Show Toast Notification

```javascript
const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

const showToast = (message, type = 'info') => {
  setToast({ visible: true, message, type });
};

// In render:
<Toast
  visible={toast.visible}
  message={toast.message}
  type={toast.type}
  onDismiss={() => setToast({ ...toast, visible: false })}
/>
```

### Use Async State Hook

```javascript
import useAsyncState from '../hooks/useAsyncState';

const { data, loading, error, execute } = useAsyncState(getUnpaidBills);

useEffect(() => {
  execute('RES001');
}, []);
```

---

## 🎨 Theme Colors

```javascript
import { COLORS } from '../constants/theme';

COLORS.primaryDarkTeal    // #005257
COLORS.accentGreen        // #34D399
COLORS.alertRed           // #EF4444
COLORS.highPriorityRed    // #F87171
COLORS.textPrimary        // #FFFFFF
COLORS.textSecondary      // #E5E7EB
COLORS.cardBackground     // #F9FAFB
COLORS.modalBackground    // #FFFFFF
```

---

## 🧪 Testing Snippets

### Test a Component

```javascript
import { render, fireEvent } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

test('renders correctly', () => {
  const { getByText } = render(<MyComponent />);
  expect(getByText('Expected Text')).toBeTruthy();
});

test('handles press', () => {
  const onPress = jest.fn();
  const { getByText } = render(<MyComponent onPress={onPress} />);
  
  fireEvent.press(getByText('Button'));
  expect(onPress).toHaveBeenCalled();
});
```

### Test a Service Function

```javascript
import { getResidentSummary } from '../paymentService';

test('returns summary data', async () => {
  const result = await getResidentSummary('RES001');
  
  expect(result).toBeDefined();
  expect(result.balance).toBeGreaterThanOrEqual(0);
});
```

---

## 🔍 Debugging Tips

### Enable Console Logs

Payment service includes detailed console logs:
- `[Payment Service]` - Service operations
- `[Payment Gateway]` - Gateway simulation
- `[NOTIFICATION]` - Mock notifications
- `[PDF Generator]` - Receipt generation
- `[EMAIL]` - Email sending

### Check Mock Data

Edit `src/api/mockData.js` to modify:
- Resident information
- Bill amounts and due dates
- Payment methods
- Available credits

### Test Payment Success/Failure

The mock gateway has a 95% success rate. To test failures:
1. Make multiple payment attempts
2. Check console for `[Payment Gateway] Payment failed` messages
3. Verify error handling in UI

---

## 📊 Mock Data Reference

### Resident ID
```javascript
const RESIDENT_ID = 'RES001'; // Kumari Silva
```

### Unpaid Bills
```javascript
'BILL_2024_102' // Rs. 1,250 (due Oct 15)
'BILL_2024_103' // Rs. 1,800 (due Nov 15)
```

### Payment Methods
```javascript
'PM001' // Visa **** 4242 (default)
'PM002' // Commercial Bank **** 1234
'PM003' // Mastercard **** 5555
```

### Credits
```javascript
'CREDIT001' // Rs. 500 (recyclable)
'CREDIT002' // Rs. 750 (e-waste)
'CREDIT003' // Rs. 300 (recyclable)
```

---

## 🎯 Common Tasks

### Add a New Screen

1. Create file in `src/screens/Payments/`
2. Import navigation and context
3. Add to navigation stack
4. Create tests in `__tests__/`

### Add a New Component

1. Create file in `src/components/`
2. Follow existing component structure
3. Use theme colors and fonts
4. Add PropTypes or TypeScript types
5. Create tests

### Add a New Service Function

1. Add to `src/api/paymentService.js`
2. Include JSDoc comments
3. Add error handling
4. Simulate network delay
5. Write unit tests

### Modify Mock Data

1. Open `src/api/mockData.js`
2. Edit the relevant constant
3. Restart the app
4. Update tests if needed

---

## 🐛 Troubleshooting

### App Won't Start
```bash
npm start -- --reset-cache
```

### Tests Failing
```bash
npm test -- --clearCache
npm test
```

### Navigation Errors
```bash
npm install @react-navigation/native @react-navigation/stack
```

### Module Not Found
```bash
rm -rf node_modules
npm install
```

---

## 📱 Navigation Flow

```
PaymentHub
    ↓ (Select bill)
PaymentPage (Step 1: Review)
    ↓ (Next)
PaymentPage (Step 2: Select Method)
    ↓ (Next)
PaymentPage (Step 3: Confirm)
    ↓ (Complete Payment)
PaymentConfirmation
    ↓ (View History)
PaymentHistory
    ↓ (Tap transaction)
ReceiptViewScreen
```

---

## 🔐 Validation Functions

```javascript
// Bill amount validation
validateBillAmount(amount) // { valid: boolean, message: string }

// Credit amount validation
validateCreditAmount(creditAmount, billAmount)

// Payment method validation
validatePaymentMethod(method)

// Session expiry check
isSessionExpired(expiresAt) // boolean

// Card number validation (Luhn algorithm)
validateCardNumber(cardNumber)

// CVV validation
validateCVV(cvv)

// Card expiry validation
validateCardExpiry(month, year)

// Email validation
validateEmail(email)

// Phone validation (Sri Lankan format)
validatePhone(phone)
```

---

## 📈 Performance Tips

### Use Memoization

```javascript
import { useMemo, useCallback } from 'react';

const memoizedValue = useMemo(() => 
  expensiveCalculation(data), 
  [data]
);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### Optimize Lists

```javascript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

---

## 🎨 Styling Patterns

### Card Style

```javascript
{
  backgroundColor: COLORS.cardBackground,
  borderRadius: 12,
  padding: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}
```

### Button Style

```javascript
{
  backgroundColor: COLORS.accentGreen,
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: 'center',
}
```

---

## 📞 Need Help?

- **Module README:** `src/screens/Payments/README.md`
- **Setup Guide:** `SETUP_GUIDE.md`
- **Full Summary:** `PAYMENT_MODULE_SUMMARY.md`
- **Developer:** Gabilan S (IT22060426)

---

**Quick Tip:** Use `Cmd/Ctrl + F` to search this document for specific topics!
