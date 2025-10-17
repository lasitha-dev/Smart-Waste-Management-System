/**
 * LoginScreen
 * Role-based authentication screen
 * Allows users to login as Admin (scheduling) or Crew (bin collection)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, USER_ROLES } from '../../context/AuthContext';
import { COLORS, FONTS } from '../../constants/theme';

/**
 * LoginScreen Component
 */
const LoginScreen = () => {
  const { login, quickLogin, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  /**
   * Handle role selection
   */
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    // Auto-fill credentials based on role
    if (role === USER_ROLES.ADMIN) {
      setEmail('admin@waste.com');
      setPassword('admin123');
    } else {
      setEmail('crew@waste.com');
      setPassword('crew123');
    }
  };

  /**
   * Handle quick login (demo mode)
   */
  const handleQuickLogin = async (role) => {
    setIsAuthenticating(true);
    const result = await quickLogin(role);
    
    if (!result.success) {
      Alert.alert('Login Failed', result.message || 'An error occurred');
    }
    setIsAuthenticating(false);
  };

  /**
   * Handle login with credentials
   */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter email and password');
      return;
    }

    if (!selectedRole) {
      Alert.alert('Select Role', 'Please select your role to continue');
      return;
    }

    setIsAuthenticating(true);
    const result = await login(email, password, selectedRole);
    
    if (!result.success) {
      Alert.alert('Login Failed', result.message || 'Invalid credentials');
    }
    setIsAuthenticating(false);
  };

  /**
   * Render role selection cards
   */
  const renderRoleCards = () => (
    <View style={styles.rolesContainer}>
      {/* Admin Role Card */}
      <TouchableOpacity
        style={[
          styles.roleCard,
          styles.adminCard,
          selectedRole === USER_ROLES.ADMIN && styles.selectedCard,
        ]}
        onPress={() => handleRoleSelect(USER_ROLES.ADMIN)}
        activeOpacity={0.8}
      >
        <View style={styles.roleIconContainer}>
          <Text style={styles.roleIcon}>👨‍💼</Text>
        </View>
        <Text style={styles.roleTitle}>Admin</Text>
        <Text style={styles.roleSubtitle}>Scheduling & Management</Text>
        <View style={styles.featuresList}>
          <Text style={styles.featureItem}>📅 Schedule Pickups</Text>
          <Text style={styles.featureItem}>📊 View Reports</Text>
          <Text style={styles.featureItem}>💬 Manage Feedback</Text>
        </View>
        {selectedRole === USER_ROLES.ADMIN && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>✓ Selected</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Crew Role Card */}
      <TouchableOpacity
        style={[
          styles.roleCard,
          styles.crewCard,
          selectedRole === USER_ROLES.CREW && styles.selectedCard,
        ]}
        onPress={() => handleRoleSelect(USER_ROLES.CREW)}
        activeOpacity={0.8}
      >
        <View style={styles.roleIconContainer}>
          <Text style={styles.roleIcon}>👷</Text>
        </View>
        <Text style={styles.roleTitle}>Crew</Text>
        <Text style={styles.roleSubtitle}>Collection & Routes</Text>
        <View style={styles.featuresList}>
          <Text style={styles.featureItem}>🗑️ Bin Collection</Text>
          <Text style={styles.featureItem}>🚛 Route Management</Text>
          <Text style={styles.featureItem}>📈 Analytics</Text>
        </View>
        {selectedRole === USER_ROLES.CREW && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>✓ Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  /**
   * Render credential input form
   */
  const renderCredentialsForm = () => {
    if (!selectedRole) return null;

    return (
      <View style={styles.credentialsContainer}>
        <Text style={styles.credentialsTitle}>
          Login as {selectedRole === USER_ROLES.ADMIN ? 'Admin' : 'Crew'}
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isAuthenticating}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.textSecondary}
            secureTextEntry
            editable={!isAuthenticating}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.loginButton,
            selectedRole === USER_ROLES.ADMIN ? styles.adminButton : styles.crewButton,
            isAuthenticating && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickLoginButton}
          onPress={() => handleQuickLogin(selectedRole)}
          disabled={isAuthenticating}
        >
          <Text style={styles.quickLoginText}>Quick Demo Login</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appIcon}>🗑️</Text>
            <Text style={styles.appTitle}>Smart Waste</Text>
            <Text style={styles.appTitle}>Management System</Text>
            <Text style={styles.appSubtitle}>Choose your role to continue</Text>
          </View>

          {/* Role Selection */}
          {renderRoleCards()}

          {/* Credentials Form */}
          {renderCredentialsForm()}

          {/* Demo Info */}
          {selectedRole && (
            <View style={styles.demoInfo}>
              <Text style={styles.demoInfoText}>💡 Demo Credentials</Text>
              <Text style={styles.demoCredential}>
                {selectedRole === USER_ROLES.ADMIN 
                  ? '📧 admin@waste.com | 🔑 admin123'
                  : '📧 crew@waste.com | 🔑 crew123'}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  rolesContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  roleCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  adminCard: {
    borderColor: '#E8F5E9',
  },
  crewCard: {
    borderColor: '#E0F2F1',
  },
  selectedCard: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  roleIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  roleIcon: {
    fontSize: 48,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresList: {
    gap: 6,
  },
  featureItem: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  credentialsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  credentialsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  adminButton: {
    backgroundColor: '#2E7D32',
  },
  crewButton: {
    backgroundColor: '#006B5E',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickLoginButton: {
    paddingVertical: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  quickLoginText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  demoInfo: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  demoInfoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
  },
  demoCredential: {
    fontSize: 12,
    color: '#F57C00',
    textAlign: 'center',
  },
});

export default LoginScreen;
