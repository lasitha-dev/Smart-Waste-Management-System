/**
 * Admin Profile Screen
 * Profile management screen for admin users
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module AdminProfileScreen
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminProfile Screen Component
 */
const AdminProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const profileItems = [
    { id: '1', icon: '👤', label: 'Edit Profile', screen: null },
    { id: '2', icon: '📍', label: 'Manage Addresses', screen: null },
    { id: '3', icon: '🗑️', label: 'My Bins', screen: null },
    { id: '4', icon: '🔔', label: 'Notifications', screen: null },
    { id: '5', icon: '💳', label: 'Payment Methods', screen: null },
    { id: '6', icon: '📜', label: 'Terms & Conditions', screen: null },
    { id: '7', icon: '🔒', label: 'Privacy Policy', screen: null },
    { id: '8', icon: '❓', label: 'Help & Support', screen: null },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => {
        if (item.screen) {
          navigation.navigate(item.screen);
        } else {
          Alert.alert('Coming Soon', `${item.label} feature will be available soon`);
        }
      }}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <Text style={styles.menuLabel}>{item.label}</Text>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user?.avatar || '👨‍💼'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Admin User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'admin@waste.com'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>ADMIN</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Active Bins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$45</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          {profileItems.slice(0, 3).map(item => renderMenuItem(item))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {profileItems.slice(3, 5).map(item => renderMenuItem(item))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          {profileItems.slice(5).map(item => renderMenuItem(item))}
        </View>

        {/* App Info */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCopyright}>© 2025 Smart Waste Management</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  content: {
    flex: 1
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarText: {
    fontSize: 40
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  roleBadge: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 8
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5'
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32
  },
  menuLabel: {
    fontSize: 16,
    color: '#333'
  },
  menuArrow: {
    fontSize: 24,
    color: '#CCC'
  },
  appInfoContainer: {
    alignItems: 'center',
    paddingVertical: 24
  },
  appVersion: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4
  },
  appCopyright: {
    fontSize: 12,
    color: '#999'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336'
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336'
  },
  bottomSpacer: {
    height: 32
  }
});

export default AdminProfileScreen;
