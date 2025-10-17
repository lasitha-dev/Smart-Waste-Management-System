/**
 * Payment Context
 * Global state management for payment module
 * @module PaymentContext
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const PaymentContext = createContext();

/**
 * Payment Provider Component
 * Wraps the app to provide payment state
 */
export const PaymentProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [appliedCredits, setAppliedCredits] = useState(0);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [lastPaymentResult, setLastPaymentResult] = useState(null);

  /**
   * Initiates a new payment session
   */
  const startPaymentSession = useCallback((session) => {
    setCurrentSession(session);
    setPaymentInProgress(false);
    setLastPaymentResult(null);
  }, []);

  /**
   * Clears the current payment session
   */
  const clearPaymentSession = useCallback(() => {
    setCurrentSession(null);
    setSelectedBill(null);
    setSelectedPaymentMethod(null);
    setAppliedCredits(0);
    setPaymentInProgress(false);
  }, []);

  /**
   * Selects a bill for payment
   */
  const selectBill = useCallback((bill) => {
    setSelectedBill(bill);
  }, []);

  /**
   * Selects a payment method
   */
  const selectPaymentMethod = useCallback((method) => {
    setSelectedPaymentMethod(method);
  }, []);

  /**
   * Updates applied credits amount
   */
  const updateAppliedCredits = useCallback((amount) => {
    setAppliedCredits(amount);
  }, []);

  /**
   * Marks payment as in progress
   */
  const markPaymentInProgress = useCallback((inProgress) => {
    setPaymentInProgress(inProgress);
  }, []);

  /**
   * Stores the last payment result
   */
  const storePaymentResult = useCallback((result) => {
    setLastPaymentResult(result);
  }, []);

  /**
   * Resets all payment state
   */
  const resetPaymentState = useCallback(() => {
    setCurrentSession(null);
    setSelectedBill(null);
    setSelectedPaymentMethod(null);
    setAppliedCredits(0);
    setPaymentInProgress(false);
    setLastPaymentResult(null);
  }, []);

  const value = {
    currentSession,
    selectedBill,
    selectedPaymentMethod,
    appliedCredits,
    paymentInProgress,
    lastPaymentResult,
    startPaymentSession,
    clearPaymentSession,
    selectBill,
    selectPaymentMethod,
    updateAppliedCredits,
    markPaymentInProgress,
    storePaymentResult,
    resetPaymentState,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

/**
 * Custom hook to use payment context
 * @returns {Object} Payment context value
 */
export const usePayment = () => {
  const context = useContext(PaymentContext);
  
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  
  return context;
};

export default PaymentContext;
