# Manual Credit Application - Complete User Guide

## Overview
The Manual Credit Application feature gives users complete control over which credits they apply to their bills. Unlike Automatic mode (which uses FIFO strategy), Manual mode lets users strategically choose credits based on their preferences.

## Why Use Manual Mode?

### Strategic Credit Management
- **Save specific credits** for future use
- **Preserve expiring credits** for specific purposes
- **Apply only certain types** (e.g., only recyclable credits)
- **Test different amounts** before committing

### User Scenarios

**Scenario 1: Saving Credits for Larger Bills**
```
User has:
- Rs. 500 recyclable credits (expires in 60 days)
- Rs. 300 referral credits (no expiration)

Current bill: Rs. 400

Strategy: Apply Rs. 300 referral credits now, save Rs. 500 for next month's larger bill
```

**Scenario 2: Using Expiring Credits First**
```
User has:
- Rs. 200 credits expiring in 3 days
- Rs. 800 credits expiring in 90 days

Current bill: Rs. 500

Strategy: Manually select the Rs. 200 expiring credit + Rs. 300 from the other
```

**Scenario 3: Partial Payment**
```
User has Rs. 1,000 credits
Current bill: Rs. 1,500

Strategy: Apply Rs. 1,000 credits, pay remaining Rs. 500 with card
```

## Three Selection Methods

### Method 1: Checkbox Selection

**Best For:**
- Selecting specific credit batches
- Seeing full details of each credit
- Strategic credit management

**How to Use:**
1. Navigate to Apply Points screen
2. Select a bill
3. Choose "Manual Selection"
4. Select "Checkboxes" tab
5. Check/uncheck credits individually
6. Use "Select All" or "Clear All" for quick actions
7. Review summary
8. Accept terms and apply

**Features:**
- ✓ See source, amount, earned date, expiration for each credit
- ✓ Visual "EXPIRING" badge for urgent credits
- ✓ Prevents selection of expired/invalid credits
- ✓ Real-time total calculation
- ✓ Selected credits highlighted in blue

**Example:**
```
Available Credits:
☐ Recyclable - Rs. 500 (Expires Dec 31, 2025)
☐ E-waste - Rs. 750 (Expires Nov 15, 2025) [EXPIRING]
☐ Referral - Rs. 300 (No expiration)

User checks:
✓ E-waste - Rs. 750
✓ Referral - Rs. 300

Total Selected: Rs. 1,050
Bill: Rs. 1,250
Remaining: Rs. 200
```

### Method 2: Custom Amount Input

**Best For:**
- Knowing exact amount to apply
- Quick entry when amount is predetermined
- Precise control

**How to Use:**
1. Navigate to Apply Points screen
2. Select a bill
3. Choose "Manual Selection"
4. Select "Custom Amount" tab
5. Type amount in input field
6. Or use quick buttons (1/2 Bill, Full Bill, Max)
7. Review summary
8. Accept terms and apply

**Features:**
- ✓ Real-time validation as you type
- ✓ Visual feedback (green/red border)
- ✓ Range information display
- ✓ Quick amount buttons
- ✓ Decimal precision validation (max 2 places)

**Validation Rules:**
```javascript
✓ Must be a number
✓ Cannot be negative
✓ Cannot be zero
✓ Cannot exceed available credits
✓ Cannot exceed bill amount
✓ Maximum 2 decimal places
```

**Example:**
```
Available: Rs. 1,550
Bill: Rs. 1,250

User types: 800
✓ Valid! (Green border)
Preview: Bill Rs. 1,250 - Rs. 800 = Rs. 450 remaining

User types: 2000
❌ Invalid! "You only have Rs. 1,550 available"
```

**Quick Buttons:**
- **1/2 Bill:** Applies half of bill amount (Rs. 625 for Rs. 1,250 bill)
- **Full Bill:** Applies full bill amount (Rs. 1,250)
- **Max:** Applies maximum available, capped at bill (Rs. 1,250)

### Method 3: Slider

**Best For:**
- Visual, intuitive control
- Mobile-friendly touch interface
- Exploring different amounts
- Quick adjustments

**How to Use:**
1. Navigate to Apply Points screen
2. Select a bill
3. Choose "Manual Selection"
4. Select "Slider" tab
5. Drag slider to desired amount
6. Or use preset buttons (Min, 1/4, 1/2, Max)
7. Review summary
8. Accept terms and apply

**Features:**
- ✓ Real-time value display with percentage
- ✓ Smooth Rs. 10 increments
- ✓ Visual progress indicator
- ✓ Preset buttons for common amounts
- ✓ Touch-friendly for mobile

**Example:**
```
Slider: [====●════════════]
        Rs. 0              Rs. 1,550

Current Position: Rs. 750 (48%)

Preset Buttons:
[Min]  [1/4]  [1/2]  [Max]
Rs. 0  Rs. 387 Rs. 775 Rs. 1,550
```

## Comparison Table

| Feature | Checkbox | Custom Input | Slider |
|---------|----------|--------------|--------|
| **Precision** | Very High | Very High | Medium |
| **Speed** | Medium | Fast | Very Fast |
| **Control** | Specific batches | Exact amount | Range |
| **Best For** | Strategic selection | Known amounts | Exploration |
| **Mobile Friendly** | Good | Good | Excellent |
| **Learning Curve** | Easy | Easy | Very Easy |
| **Credit Details** | Full details shown | Not shown | Not shown |

## Real-Time Validation

### Checkbox Mode Validation
```javascript
When user clicks a checkbox:
1. Check if credit is active
   ❌ If not: "This credit is no longer active"
   
2. Check if credit has expired
   ❌ If expired: "This credit has expired"
   
3. Check if credit amount is valid
   ❌ If invalid: "Invalid credit amount"
   
4. Calculate new total
   ⚠️ If exceeds bill: "Selected credits exceed bill amount. Only bill amount will be applied."
   
5. Update preview in real-time
```

### Custom Input Validation
```javascript
As user types each character:
1. Check if empty
   → Clear error, show placeholder
   
2. Check if numeric
   ❌ If not: "Amount must be a valid number"
   
3. Check if negative
   ❌ If negative: "Amount cannot be negative"
   
4. Check if zero
   ❌ If zero: Clear error (allow empty state)
   
5. Check decimal places
   ❌ If > 2: "Amount can have maximum 2 decimal places"
   
6. Check if exceeds available
   ❌ If exceeds: "You only have Rs. X available"
   
7. Check if exceeds bill
   ⚠️ If exceeds: "Amount exceeds bill. Only bill amount will be applied."
   
8. Update preview in real-time
```

### Slider Validation
```javascript
As user drags slider:
1. Round to nearest Rs. 10
2. Cap at bill amount (don't apply more than needed)
3. Update preview in real-time
4. Show percentage of available credits
```

## Error Messages

### Common Errors

**NO_BILL_SELECTED**
```
Message: "Please select a bill"
Action: Select a bill from the dropdown
```

**NO_CREDITS_SELECTED**
```
Message: "Please select at least one credit"
Action: Check credits, enter amount, or use slider
```

**INSUFFICIENT_CREDITS**
```
Message: "You only have Rs. 1,550 available"
Action: Reduce amount or select fewer credits
```

**INVALID_AMOUNT**
```
Message: "Please enter a valid amount"
Action: Enter a number between 0 and available credits
```

**CREDIT_EXPIRED**
```
Message: "This credit has expired"
Action: Deselect the expired credit
```

**TERMS_NOT_ACCEPTED**
```
Message: "Please accept terms and conditions"
Action: Check the terms checkbox
```

## Step-by-Step Walkthrough

### Complete Flow: Checkbox Mode

```
Step 1: Open Apply Points Screen
├─ From Payment Hub, tap "Apply Points"
└─ Screen loads with unpaid bills

Step 2: Select Bill
├─ See list of unpaid bills
├─ Tap on "BILL_2024_102 (Rs. 1,250 due)"
└─ Bill card highlights in blue

Step 3: Choose Manual Mode
├─ See two options: Automatic | Manual
├─ Tap "Manual Selection"
└─ Manual options appear

Step 4: Select Checkbox Mode
├─ See three tabs: Checkboxes | Custom Amount | Slider
├─ "Checkboxes" is default
└─ Credit list appears

Step 5: Select Credits
├─ See available credits:
│  ☐ Recyclable - Rs. 500 (Expires Dec 31, 2025)
│  ☐ E-waste - Rs. 750 (Expires Nov 15, 2025) [EXPIRING]
│  ☐ Referral - Rs. 300 (No expiration)
│
├─ Tap E-waste checkbox
│  ✓ E-waste - Rs. 750 (highlighted in blue)
│  Preview updates: Rs. 750 selected, Rs. 500 remaining
│
└─ Tap Referral checkbox
   ✓ Referral - Rs. 300 (highlighted in blue)
   Preview updates: Rs. 1,050 selected, Rs. 200 remaining

Step 6: Review Summary
├─ Bill Amount: Rs. 1,250
├─ Credits to Apply: −Rs. 1,050
├─ ─────────────────────
└─ New Amount Due: Rs. 200

Step 7: Accept Terms
├─ See checkbox: "I understand that applied credits cannot be reversed"
├─ Tap checkbox
└─ ✓ Terms accepted, Apply button enabled

Step 8: Apply Credits
├─ Tap "APPLY CREDITS" button
├─ Loading indicator appears (2 seconds)
├─ Success toast: "Credits applied successfully!"
└─ Navigate back to Payment Hub

Step 9: Verify on Payment Hub
├─ Bill amount updated: Rs. 1,250 → Rs. 200
├─ Available credits updated: Rs. 1,550 → Rs. 500
└─ Can proceed to pay remaining Rs. 200
```

### Complete Flow: Custom Amount

```
Step 1-3: Same as Checkbox Mode

Step 4: Select Custom Amount Mode
├─ Tap "Custom Amount" tab
└─ Input field appears

Step 5: Enter Amount
├─ Tap input field
├─ Keyboard appears
├─ Type: 8
│  → Shows: Rs. 8
│  → Preview: Rs. 1,242 remaining
│
├─ Type: 0
│  → Shows: Rs. 80
│  → Preview: Rs. 1,170 remaining
│
└─ Type: 0
   → Shows: Rs. 800
   → Preview: Rs. 450 remaining
   → Border turns green ✓

Step 6-9: Same as Checkbox Mode
```

### Complete Flow: Slider

```
Step 1-3: Same as Checkbox Mode

Step 4: Select Slider Mode
├─ Tap "Slider" tab
└─ Slider appears

Step 5: Adjust Amount
├─ See slider at Rs. 0
├─ Drag slider to right
│  → Value updates in real-time
│  → Shows: Rs. 750 (48%)
│  → Preview updates: Rs. 500 remaining
│
├─ Or tap "1/2" preset button
│  → Slider jumps to Rs. 775
│  → Preview updates: Rs. 475 remaining
│
└─ Fine-tune by dragging
   → Final: Rs. 800
   → Preview: Rs. 450 remaining

Step 6-9: Same as Checkbox Mode
```

## Tips & Best Practices

### For Users

**Tip 1: Use Expiring Credits First**
```
Check the "EXPIRING" badge in checkbox mode
Apply those credits before they expire
```

**Tip 2: Save Credits for Larger Bills**
```
If you have a small bill and lots of credits,
consider saving some for next month's larger bill
```

**Tip 3: Use Quick Buttons**
```
Custom Amount mode: Use "1/2 Bill" or "Full Bill" for speed
Slider mode: Use presets (1/4, 1/2, Max) for common amounts
```

**Tip 4: Double-Check Before Applying**
```
Review the summary carefully
Credits cannot be reversed once applied
```

**Tip 5: Combine with Payment**
```
Apply credits to reduce bill
Then pay remaining amount with card/bank
```

### For Developers

**Tip 1: Always Validate**
```javascript
// Validate on every state change
useEffect(() => {
  if (selectedBill && availableCredits.length > 0) {
    recalculate();
  }
}, [applyMethod, selectedBill, manualSelectedCredits, customAmount, sliderValue]);
```

**Tip 2: Provide Real-Time Feedback**
```javascript
// Update preview immediately
const handleCustomAmountChange = (text) => {
  setCustomAmount(text);
  // Validation and preview update happen in useEffect
};
```

**Tip 3: Prevent Invalid Actions**
```javascript
// Disable button when invalid
<TouchableOpacity
  disabled={!termsAccepted || creditsToApply === 0 || processing}
  style={[
    styles.applyButton,
    (!termsAccepted || creditsToApply === 0) && styles.applyButtonDisabled
  ]}
>
```

**Tip 4: Show Clear Error Messages**
```javascript
// User-friendly error messages
if (parsedAmount > availableTotal) {
  return {
    valid: false,
    error: 'INSUFFICIENT_CREDITS',
    message: `You only have Rs. ${availableTotal} available`
  };
}
```

## Troubleshooting

### Issue: "Apply Credits" button is disabled

**Possible Causes:**
1. No credits selected/entered
2. Terms not accepted
3. Processing in progress

**Solution:**
- Ensure you've selected credits or entered an amount
- Check the terms checkbox
- Wait for processing to complete

### Issue: Can't select a credit in checkbox mode

**Possible Causes:**
1. Credit has expired
2. Credit status is not "active"
3. Credit amount is invalid

**Solution:**
- Check expiration date
- Try a different credit
- Refresh the screen

### Issue: Custom amount shows error

**Possible Causes:**
1. Amount exceeds available credits
2. Amount exceeds bill
3. Non-numeric input
4. Too many decimal places

**Solution:**
- Check available credits amount
- Check bill amount
- Enter only numbers
- Use maximum 2 decimal places

### Issue: Slider not moving smoothly

**Possible Causes:**
1. Device performance issue
2. Too many credits loaded

**Solution:**
- Close other apps
- Restart the app
- Use Custom Amount mode instead

## Summary

Manual Credit Application provides three flexible ways to apply credits:

1. **Checkbox Mode** - For strategic, detailed selection
2. **Custom Amount** - For quick, precise entry
3. **Slider** - For visual, intuitive control

All three modes include:
- ✓ Real-time validation
- ✓ Instant preview updates
- ✓ Error prevention
- ✓ User-friendly feedback
- ✓ Quick action buttons

Choose the mode that best fits your needs and workflow!
