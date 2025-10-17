/**
 * Apply Points Screen
 * Allows users to apply credits to unpaid bills with validation
 * @module ApplyPoints
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import {
  calculateAutomaticApplication,
  calculateManualApplication,
  validateCustomAmountInput,
  validateBillForCreditApplication,
} from '../../utils/creditHelpers';
import { getUnpaidBills, getAvailableCredits } from '../../api/paymentService';
import LoadingIndicator from '../../components/LoadingIndicator';
import Toast from '../../components/Toast';

const RESIDENT_ID = 'RES001';

const ApplyPoints = ({ navigation, route }) => {
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [availableCredits, setAvailableCredits] = useState([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  
  const [applyMethod, setApplyMethod] = useState('automatic');
  const [manualSelectionMode, setManualSelectionMode] = useState('checkbox');
  const [manualSelectedCredits, setManualSelectedCredits] = useState([]);
  const [customAmount, setCustomAmount] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  
  const [creditsToApply, setCreditsToApply] = useState(0);
  const [creditsUsed, setCreditsUsed] = useState([]);
  const [newBillAmount, setNewBillAmount] = useState(0);
  const [creditsRemaining, setCreditsRemaining] = useState(0);
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedBill && availableCredits.length > 0) {
      recalculate();
    }
  }, [applyMethod, selectedBill, manualSelectedCredits, customAmount, availableCredits]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bills, credits] = await Promise.all([
        getUnpaidBills(RESIDENT_ID),
        getAvailableCredits(RESIDENT_ID),
      ]);

      const activeCredits = credits.filter(c => c.status === 'active');
      setUnpaidBills(bills);
      setAvailableCredits(activeCredits);
      setTotalAvailable(activeCredits.reduce((sum, c) => sum + c.amount, 0));
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const recalculate = () => {
    if (!selectedBill) return;

    if (applyMethod === 'automatic') {
      const result = calculateAutomaticApplication(availableCredits, selectedBill.amount);
      setCreditsToApply(result.creditsToApply);
      setCreditsUsed(result.creditsUsed);
      setNewBillAmount(result.newBillAmount);
      setCreditsRemaining(result.creditsRemaining);
      setError(null);
    } else if (applyMethod === 'manual') {
      if (manualSelectionMode === 'checkbox' && manualSelectedCredits.length > 0) {
        const result = calculateManualApplication(manualSelectedCredits, availableCredits, selectedBill.amount);
        if (result.valid) {
          setCreditsToApply(result.creditsToApply);
          setCreditsUsed(result.creditsUsed);
          setNewBillAmount(result.newBillAmount);
          setCreditsRemaining(result.creditsRemaining);
          setError(null);
        } else {
          setError(result.message);
        }
      } else if (manualSelectionMode === 'custom' && customAmount) {
        const validation = validateCustomAmountInput(customAmount, totalAvailable, selectedBill.amount);
        if (validation.valid) {
          setCreditsToApply(validation.amount);
          setNewBillAmount(selectedBill.amount - validation.amount);
          setCreditsRemaining(totalAvailable - validation.amount);
          setError(null);
        } else {
          setError(validation.message);
        }
      } else if (manualSelectionMode === 'slider') {
        const creditsToApplyValue = Math.min(sliderValue, selectedBill.amount);
        setCreditsToApply(creditsToApplyValue);
        setNewBillAmount(Math.max(0, selectedBill.amount - creditsToApplyValue));
        setCreditsRemaining(totalAvailable - creditsToApplyValue);
        setError(null);
      } else {
        setCreditsToApply(0);
        setNewBillAmount(selectedBill.amount);
        setCreditsRemaining(totalAvailable);
      }
    }
  };

  const handleApply = async () => {
    if (!selectedBill) {
      showToast('Please select a bill', 'error');
      return;
    }

    if (creditsToApply <= 0) {
      showToast('Please select credits to apply', 'error');
      return;
    }

    if (!termsAccepted) {
      showToast('Please accept the terms', 'error');
      return;
    }

    setProcessing(true);
    
    setTimeout(() => {
      setProcessing(false);
      showToast('Credits applied successfully!', 'success');
      setTimeout(() => {
        navigation.navigate('PaymentHub', { refresh: true });
      }, 1000);
    }, 2000);
  };

  const toggleCreditSelection = (creditId) => {
    const credit = availableCredits.find(c => c.id === creditId);
    if (!credit) return;

    if (credit.status !== 'active') {
      showToast('This credit is no longer active', 'error');
      return;
    }

    if (credit.expirationDate && new Date(credit.expirationDate) < new Date()) {
      showToast('This credit has expired', 'error');
      return;
    }

    setManualSelectedCredits(prev => 
      prev.includes(creditId) 
        ? prev.filter(id => id !== creditId)
        : [...prev, creditId]
    );
  };

  const handleCustomAmountChange = (text) => {
    setCustomAmount(text);
  };

  const handleSliderChange = (value) => {
    setSliderValue(value);
  };

  const handleQuickAmount = (amount) => {
    if (manualSelectionMode === 'custom') {
      setCustomAmount(amount.toString());
    } else if (manualSelectionMode === 'slider') {
      setSliderValue(amount);
    }
  };

  const handleSelectAllCredits = () => {
    const allIds = availableCredits.map(c => c.id);
    setManualSelectedCredits(allIds);
  };

  const handleClearAllCredits = () => {
    setManualSelectedCredits([]);
  };

  if (loading) {
    return <LoadingIndicator type="spinner" message="Loading..." />;
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apply Points</Text>
          <View style={{ width: 24 }} />
        </View>

        {unpaidBills.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Unpaid Bills</Text>
            <Text style={styles.emptySubtitle}>You have no bills to apply credits to</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Bill</Text>
              {unpaidBills.map(bill => (
                <TouchableOpacity
                  key={bill.id}
                  style={[
                    styles.billCard,
                    selectedBillId === bill.id && styles.billCardSelected
                  ]}
                  onPress={() => {
                    setSelectedBillId(bill.id);
                    setSelectedBill(bill);
                  }}
                >
                  <Text style={styles.billId}>{bill.id}</Text>
                  <Text style={styles.billAmount}>Rs. {bill.amount.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedBill && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Available Credits</Text>
                  <Text style={styles.availableAmount}>Rs. {totalAvailable.toLocaleString()}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Apply Method</Text>
                  
                  <TouchableOpacity
                    style={[styles.methodCard, applyMethod === 'automatic' && styles.methodCardSelected]}
                    onPress={() => setApplyMethod('automatic')}
                  >
                    <View style={styles.radio}>
                      {applyMethod === 'automatic' && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.methodContent}>
                      <Text style={styles.methodTitle}>Automatic (Recommended)</Text>
                      <Text style={styles.methodDesc}>Apply maximum available credits</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.methodCard, applyMethod === 'manual' && styles.methodCardSelected]}
                    onPress={() => setApplyMethod('manual')}
                  >
                    <View style={styles.radio}>
                      {applyMethod === 'manual' && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.methodContent}>
                      <Text style={styles.methodTitle}>Manual Selection</Text>
                      <Text style={styles.methodDesc}>Choose amount to apply</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {applyMethod === 'manual' && (
                  <>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Selection Mode</Text>
                      <View style={styles.modeTabs}>
                        <TouchableOpacity
                          style={[styles.modeTab, manualSelectionMode === 'checkbox' && styles.modeTabActive]}
                          onPress={() => setManualSelectionMode('checkbox')}
                        >
                          <Text style={[styles.modeTabText, manualSelectionMode === 'checkbox' && styles.modeTabTextActive]}>
                            Checkboxes
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modeTab, manualSelectionMode === 'custom' && styles.modeTabActive]}
                          onPress={() => setManualSelectionMode('custom')}
                        >
                          <Text style={[styles.modeTabText, manualSelectionMode === 'custom' && styles.modeTabTextActive]}>
                            Custom Amount
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modeTab, manualSelectionMode === 'slider' && styles.modeTabActive]}
                          onPress={() => setManualSelectionMode('slider')}
                        >
                          <Text style={[styles.modeTabText, manualSelectionMode === 'slider' && styles.modeTabTextActive]}>
                            Slider
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {manualSelectionMode === 'checkbox' && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Credits</Text>
                        <FlatList
                          data={availableCredits}
                          keyExtractor={(item) => item.id}
                          scrollEnabled={false}
                          renderItem={({ item }) => {
                            const isSelected = manualSelectedCredits.includes(item.id);
                            const isExpiring = item.expirationDate && 
                              (new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24) <= 7;
                            
                            return (
                              <TouchableOpacity
                                style={[styles.creditCheckbox, isSelected && styles.creditCheckboxSelected]}
                                onPress={() => toggleCreditSelection(item.id)}
                              >
                                <View style={[styles.checkboxSmall, isSelected && styles.checkboxSmallChecked]}>
                                  {isSelected && <Text style={styles.checkmarkSmall}>✓</Text>}
                                </View>
                                <View style={styles.creditCheckboxContent}>
                                  <Text style={styles.creditCheckboxTitle}>
                                    {item.source === 'recyclable' ? 'Recyclable' : 
                                     item.source === 'ewaste' ? 'E-waste' : 
                                     item.source === 'referral' ? 'Referral' : item.source}
                                  </Text>
                                  <Text style={styles.creditCheckboxAmount}>Rs. {item.amount.toLocaleString()}</Text>
                                  <Text style={styles.creditCheckboxDate}>
                                    Expires: {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'Never'}
                                  </Text>
                                </View>
                                {isExpiring && (
                                  <View style={styles.expiringBadgeSmall}>
                                    <Text style={styles.expiringBadgeTextSmall}>EXPIRING</Text>
                                  </View>
                                )}
                              </TouchableOpacity>
                            );
                          }}
                        />
                        <View style={styles.quickActionsRow}>
                          <TouchableOpacity style={styles.quickActionButton} onPress={handleSelectAllCredits}>
                            <Text style={styles.quickActionText}>Select All</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.quickActionButton} onPress={handleClearAllCredits}>
                            <Text style={styles.quickActionText}>Clear All</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {manualSelectionMode === 'custom' && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Enter Custom Amount</Text>
                        <TextInput
                          style={[styles.input, error && styles.inputError]}
                          placeholder="Enter amount (Rs.)"
                          keyboardType="decimal-pad"
                          value={customAmount}
                          onChangeText={handleCustomAmountChange}
                        />
                        {error && <Text style={styles.errorText}>{error}</Text>}
                        <Text style={styles.rangeInfo}>
                          Available: Rs. {totalAvailable.toLocaleString()} | Bill: Rs. {selectedBill.amount.toLocaleString()}
                        </Text>
                        <View style={styles.quickActionsRow}>
                          <TouchableOpacity 
                            style={styles.quickActionButton} 
                            onPress={() => handleQuickAmount(Math.round(selectedBill.amount / 2))}
                          >
                            <Text style={styles.quickActionText}>1/2 Bill</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.quickActionButton} 
                            onPress={() => handleQuickAmount(selectedBill.amount)}
                          >
                            <Text style={styles.quickActionText}>Full Bill</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.quickActionButton} 
                            onPress={() => handleQuickAmount(Math.min(totalAvailable, selectedBill.amount))}
                          >
                            <Text style={styles.quickActionText}>Max</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {manualSelectionMode === 'slider' && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Adjust Amount with Slider</Text>
                        <View style={styles.sliderValueDisplay}>
                          <Text style={styles.sliderCurrentValue}>Rs. {Math.round(sliderValue).toLocaleString()}</Text>
                          <Text style={styles.sliderPercentage}>
                            {totalAvailable > 0 ? ((sliderValue / totalAvailable) * 100).toFixed(0) : 0}%
                          </Text>
                        </View>
                        <View style={styles.sliderContainer}>
                          <input
                            type="range"
                            min={0}
                            max={totalAvailable}
                            value={sliderValue}
                            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                            step={10}
                            style={{
                              width: '100%',
                              height: 8,
                              borderRadius: 4,
                              outline: 'none',
                              background: `linear-gradient(to right, #34D399 0%, #34D399 ${(sliderValue / totalAvailable) * 100}%, #E5E7EB ${(sliderValue / totalAvailable) * 100}%, #E5E7EB 100%)`,
                              WebkitAppearance: 'none',
                              appearance: 'none',
                            }}
                          />
                        </View>
                        <View style={styles.sliderLabels}>
                          <Text style={styles.sliderLabel}>Rs. 0</Text>
                          <Text style={styles.sliderLabel}>Rs. {totalAvailable.toLocaleString()}</Text>
                        </View>
                        <View style={styles.quickActionsRow}>
                          <TouchableOpacity 
                            style={styles.quickActionButton} 
                            onPress={() => handleQuickAmount(0)}
                          >
                            <Text style={styles.quickActionText}>Min</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.quickActionButton} 
                            onPress={() => handleQuickAmount(totalAvailable / 4)}
                          >
                            <Text style={styles.quickActionText}>1/4</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.quickActionButton} 
                            onPress={() => handleQuickAmount(totalAvailable / 2)}
                          >
                            <Text style={styles.quickActionText}>1/2</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.quickActionButton} 
                            onPress={() => handleQuickAmount(totalAvailable)}
                          >
                            <Text style={styles.quickActionText}>Max</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </>
                )}

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Summary</Text>
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Bill Amount:</Text>
                      <Text style={styles.summaryValue}>Rs. {selectedBill.amount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Credits to Apply:</Text>
                      <Text style={[styles.summaryValue, { color: '#2196F3' }]}>
                        −Rs. {creditsToApply.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabelBold}>New Amount Due:</Text>
                      <Text style={[styles.summaryValueBold, { color: newBillAmount === 0 ? COLORS.accentGreen : COLORS.alertRed }]}>
                        Rs. {newBillAmount.toLocaleString()}
                      </Text>
                    </View>
                    {newBillAmount === 0 && (
                      <Text style={styles.fullyPaidBadge}>✓ FULLY COVERED!</Text>
                    )}
                  </View>
                </View>

                <View style={styles.section}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setTermsAccepted(!termsAccepted)}
                  >
                    <View style={[styles.checkboxBox, termsAccepted && styles.checkboxBoxChecked]}>
                      {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      I understand that applied credits cannot be reversed
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.applyButton, (!termsAccepted || creditsToApply === 0) && styles.applyButtonDisabled]}
                    onPress={handleApply}
                    disabled={!termsAccepted || creditsToApply === 0 || processing}
                  >
                    {processing ? (
                      <ActivityIndicator color={COLORS.textPrimary} />
                    ) : (
                      <Text style={styles.applyButtonText}>APPLY CREDITS</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={styles.cancelButtonText}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.primaryDarkTeal,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: FONTS.size.subheading,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 12,
  },
  billCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  billCardSelected: {
    borderColor: '#2196F3',
  },
  billId: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 4,
  },
  billAmount: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.alertRed,
  },
  availableAmount: {
    fontSize: 28,
    fontWeight: FONTS.weight.bold,
    color: '#2196F3',
  },
  methodCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: '#2196F3',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 4,
  },
  methodDesc: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: FONTS.size.body,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  errorText: {
    fontSize: FONTS.size.small,
    color: COLORS.alertRed,
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: FONTS.size.body,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.primaryDarkTeal,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 12,
  },
  summaryLabelBold: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
  },
  summaryValueBold: {
    fontSize: FONTS.size.heading,
    fontWeight: FONTS.weight.bold,
  },
  fullyPaidBadge: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.accentGreen,
    textAlign: 'center',
    marginTop: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkmark: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: FONTS.weight.bold,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: FONTS.size.small,
    color: '#6B7280',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  applyButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  applyButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  applyButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    textAlign: 'center',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: COLORS.primaryDarkTeal,
  },
  modeTabText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    color: '#6B7280',
  },
  modeTabTextActive: {
    color: COLORS.textPrimary,
  },
  creditCheckbox: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  creditCheckboxSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#EFF6FF',
  },
  checkboxSmall: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSmallChecked: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkmarkSmall: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: FONTS.weight.bold,
  },
  creditCheckboxContent: {
    flex: 1,
  },
  creditCheckboxTitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 4,
  },
  creditCheckboxAmount: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.semiBold,
    color: '#2196F3',
    marginBottom: 2,
  },
  creditCheckboxDate: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
  },
  expiringBadgeSmall: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  expiringBadgeTextSmall: {
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
    color: '#F59E0B',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  quickActionText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.primaryDarkTeal,
  },
  inputError: {
    borderColor: COLORS.alertRed,
    borderWidth: 2,
  },
  rangeInfo: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  sliderValueDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
  },
  sliderCurrentValue: {
    fontSize: 24,
    fontWeight: FONTS.weight.bold,
    color: '#2196F3',
  },
  sliderPercentage: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.semiBold,
    color: '#6B7280',
  },
  sliderContainer: {
    width: '100%',
    paddingVertical: 16,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
  },
});

export default ApplyPoints;
