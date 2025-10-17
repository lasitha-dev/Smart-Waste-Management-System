/**
 * Check Points Screen
 * Displays all available, redeemed, and expired credits with detailed information
 * @module CheckPoints
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { processCreditsForDisplay, getSourceLabel } from '../../utils/creditHelpers';
import { getAvailableCredits } from '../../api/paymentService';
import LoadingIndicator from '../../components/LoadingIndicator';
import Toast from '../../components/Toast';
import StatusMessage from '../../components/StatusMessage';
import CreditCard from '../../components/CreditCard';

const RESIDENT_ID = 'RES001';

/**
 * CheckPoints Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.route - Route object with params
 */
const CheckPoints = ({ navigation, route }) => {
  const [selectedTab, setSelectedTab] = useState('active');
  const [creditsData, setCreditsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  /**
   * Loads all credits data
   */
  const loadCredits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const allCredits = await getAvailableCredits(RESIDENT_ID);
      const processed = processCreditsForDisplay(allCredits);
      
      setCreditsData(processed);
    } catch (err) {
      setError(err.message || 'Failed to load credits');
      showToast('Failed to load credits. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCredits();
  }, []);

  /**
   * Handles pull-to-refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCredits();
    setRefreshing(false);
  }, [loadCredits]);

  /**
   * Shows toast notification
   */
  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  /**
   * Handles apply button press on a credit
   */
  const handleApplyCredit = (credit) => {
    navigation.navigate('ApplyPoints', {
      preselectedCreditId: credit.id,
      returnTo: 'CheckPoints'
    });
  };

  /**
   * Handles details button press
   */
  const handleCreditDetails = (credit) => {
    showToast('Credit details feature coming soon!', 'info');
  };

  /**
   * Handles apply now button in expiration alert
   */
  const handleApplyExpiring = () => {
    navigation.navigate('ApplyPoints', {
      autoSelectExpiring: true,
      returnTo: 'CheckPoints'
    });
  };

  /**
   * Renders the credits summary section
   */
  const renderSummary = () => {
    if (!creditsData) return null;

    const { summary, breakdown } = creditsData;

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Available Balance</Text>
        <Text style={styles.summaryAmount}>
          Rs. {summary.totalActive.toLocaleString()}
        </Text>
        
        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${Math.min((summary.totalActive / 5000) * 100, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.summarySubtitle}>
          {summary.countActive} active credit{summary.countActive !== 1 ? 's' : ''}
        </Text>

        {/* Breakdown by source */}
        {Object.keys(breakdown).length > 0 && (
          <View style={styles.breakdown}>
            <Text style={styles.breakdownTitle}>Breakdown:</Text>
            {Object.entries(breakdown).map(([source, amount]) => (
              <View key={source} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>• {getSourceLabel(source)}:</Text>
                <Text style={styles.breakdownAmount}>Rs. {amount.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  /**
   * Renders expiration alert if credits are expiring soon
   */
  const renderExpirationAlert = () => {
    if (!creditsData || creditsData.summary.expiringCount === 0) return null;

    return (
      <View style={styles.alertCard}>
        <View style={styles.alertContent}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertText}>
            <Text style={styles.alertTitle}>Credits Expiring Soon</Text>
            <Text style={styles.alertMessage}>
              Rs. {creditsData.summary.expiringAmount.toLocaleString()} expires within 7 days
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.alertButton}
          onPress={handleApplyExpiring}
        >
          <Text style={styles.alertButtonText}>APPLY NOW</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Renders tab navigation
   */
  const renderTabs = () => {
    if (!creditsData) return null;

    const tabs = [
      { key: 'active', label: `Active (${creditsData.summary.countActive})` },
      { key: 'redeemed', label: `Redeemed (${creditsData.summary.countRedeemed})` },
      { key: 'expired', label: `Expired (${creditsData.summary.countExpired})` },
    ];

    return (
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && styles.tabActive
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.key && styles.tabTextActive
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  /**
   * Gets the current tab's credit list
   */
  const getCurrentTabCredits = () => {
    if (!creditsData) return [];

    switch (selectedTab) {
      case 'active':
        return creditsData.activeCredits;
      case 'redeemed':
        return creditsData.redeemedCredits;
      case 'expired':
        return creditsData.expiredCredits;
      default:
        return [];
    }
  };

  /**
   * Renders empty state for current tab
   */
  const renderEmptyState = () => {
    const messages = {
      active: {
        icon: '🎁',
        title: 'No Active Credits',
        subtitle: 'Earn credits by recycling and completing collections'
      },
      redeemed: {
        icon: '✓',
        title: 'No Redeemed Credits',
        subtitle: 'Credits you apply to bills will appear here'
      },
      expired: {
        icon: '⏰',
        title: 'No Expired Credits',
        subtitle: 'Expired credits will appear here'
      }
    };

    const message = messages[selectedTab];

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>{message.icon}</Text>
        <Text style={styles.emptyTitle}>{message.title}</Text>
        <Text style={styles.emptySubtitle}>{message.subtitle}</Text>
      </View>
    );
  };

  /**
   * Renders credit list for current tab
   */
  const renderCreditList = () => {
    const credits = getCurrentTabCredits();

    if (credits.length === 0) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={credits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CreditCard
            credit={item}
            variant={selectedTab}
            onApply={selectedTab === 'active' ? handleApplyCredit : null}
            onDetails={handleCreditDetails}
            showActions={true}
          />
        )}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  /**
   * Renders action footer
   */
  const renderFooter = () => {
    if (!creditsData || creditsData.summary.countActive === 0) return null;

    return (
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('ApplyPoints', { returnTo: 'CheckPoints' })}
        >
          <Text style={styles.footerButtonText}>APPLY CREDITS TO BILL</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Loading state
  if (loading && !creditsData) {
    return <LoadingIndicator type="spinner" message="Loading credits..." />;
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Points</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <StatusMessage
            type="error"
            message="Failed to load some data. Pull down to refresh."
            visible={true}
          />
        )}

        {/* Summary Section */}
        {renderSummary()}

        {/* Expiration Alert */}
        {renderExpirationAlert()}

        {/* Tab Navigation */}
        {renderTabs()}

        {/* Credit List */}
        {renderCreditList()}

        {/* Spacing for footer */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Action Footer */}
      {renderFooter()}
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
  backButton: {
    padding: 8,
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
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  summaryCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.semiBold,
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: FONTS.weight.bold,
    color: '#2196F3',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34D399',
    borderRadius: 4,
  },
  summarySubtitle: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
    marginBottom: 16,
  },
  breakdown: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  breakdownTitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.primaryDarkTeal,
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: FONTS.size.small,
    color: '#6B7280',
  },
  breakdownAmount: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.primaryDarkTeal,
  },
  alertCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: '#92400E',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: FONTS.size.small,
    color: '#92400E',
  },
  alertButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primaryDarkTeal,
  },
  tabText: {
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semiBold,
    color: '#6B7280',
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingTop: 16,
  },
  emptyState: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 32,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: FONTS.size.body,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
});

export default CheckPoints;
