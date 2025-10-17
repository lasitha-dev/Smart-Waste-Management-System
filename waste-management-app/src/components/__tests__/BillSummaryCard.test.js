/**
 * BillSummaryCard Component Tests
 * Tests for bill display component
 * @module BillSummaryCard.test
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BillSummaryCard from '../BillSummaryCard';

describe('BillSummaryCard Component', () => {
  const mockBillData = {
    id: 'BILL_2024_102',
    amount: 2500,
    appliedCredits: 1250,
    finalAmount: 1250,
    status: 'unpaid',
    billingPeriod: 'Oct 1-31, 2025',
    dueDate: '2025-10-15T23:59:59.000Z',
    createdAt: '2025-10-01T00:00:00.000Z',
    taxes: 250,
    subtotal: 2750,
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== RENDERING TESTS ====================

  test('renders bill information correctly', () => {
    const { getByText } = render(
      <BillSummaryCard billData={mockBillData} onPress={mockOnPress} />
    );

    expect(getByText('BILL_2024_102')).toBeTruthy();
    expect(getByText('Oct 1-31, 2025')).toBeTruthy();
    expect(getByText(/Rs\. 2,500/)).toBeTruthy();
    expect(getByText(/Rs\. 1,250/)).toBeTruthy();
  });

  test('displays applied credits when present', () => {
    const { getByText } = render(
      <BillSummaryCard billData={mockBillData} onPress={mockOnPress} />
    );

    expect(getByText('Credits Applied:')).toBeTruthy();
    expect(getByText(/-Rs\. 1,250/)).toBeTruthy();
  });

  test('hides credits section when no credits applied', () => {
    const billWithoutCredits = { ...mockBillData, appliedCredits: 0 };
    const { queryByText } = render(
      <BillSummaryCard billData={billWithoutCredits} onPress={mockOnPress} />
    );

    expect(queryByText('Credits Applied:')).toBeNull();
  });

  test('displays pay button for unpaid bills', () => {
    const { getByText } = render(
      <BillSummaryCard billData={mockBillData} onPress={mockOnPress} showPayButton={true} />
    );

    expect(getByText('PAY NOW')).toBeTruthy();
  });

  test('hides pay button when showPayButton is false', () => {
    const { queryByText } = render(
      <BillSummaryCard billData={mockBillData} onPress={mockOnPress} showPayButton={false} />
    );

    expect(queryByText('PAY NOW')).toBeNull();
  });

  test('hides pay button for paid bills', () => {
    const paidBill = { ...mockBillData, status: 'paid' };
    const { queryByText } = render(
      <BillSummaryCard billData={paidBill} onPress={mockOnPress} showPayButton={true} />
    );

    expect(queryByText('PAY NOW')).toBeNull();
  });

  // ==================== INTERACTION TESTS ====================

  test('calls onPress when card is tapped', () => {
    const { getByText } = render(
      <BillSummaryCard billData={mockBillData} onPress={mockOnPress} />
    );

    const card = getByText('BILL_2024_102').parent.parent;
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test('calls onPress when pay button is tapped', () => {
    const { getByText } = render(
      <BillSummaryCard billData={mockBillData} onPress={mockOnPress} showPayButton={true} />
    );

    const payButton = getByText('PAY NOW');
    fireEvent.press(payButton);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  // ==================== STATUS TESTS ====================

  test('shows urgent status for bills due soon', () => {
    const urgentBill = {
      ...mockBillData,
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    };
    const { getByText } = render(
      <BillSummaryCard billData={urgentBill} onPress={mockOnPress} />
    );

    expect(getByText('URGENT')).toBeTruthy();
  });

  test('shows overdue status for past due bills', () => {
    const overdueBill = {
      ...mockBillData,
      dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    };
    const { getByText } = render(
      <BillSummaryCard billData={overdueBill} onPress={mockOnPress} />
    );

    expect(getByText('OVERDUE')).toBeTruthy();
  });

  test('shows paid status for paid bills', () => {
    const paidBill = { ...mockBillData, status: 'paid' };
    const { getByText } = render(
      <BillSummaryCard billData={paidBill} onPress={mockOnPress} />
    );

    expect(getByText('PAID')).toBeTruthy();
  });

  // ==================== EDGE CASES ====================

  test('returns null when billData is null', () => {
    const { container } = render(
      <BillSummaryCard billData={null} onPress={mockOnPress} />
    );

    expect(container.children.length).toBe(0);
  });

  test('returns null when billData is undefined', () => {
    const { container } = render(
      <BillSummaryCard billData={undefined} onPress={mockOnPress} />
    );

    expect(container.children.length).toBe(0);
  });

  test('handles missing onPress gracefully', () => {
    const { getByText } = render(
      <BillSummaryCard billData={mockBillData} />
    );

    expect(getByText('BILL_2024_102')).toBeTruthy();
  });
});
