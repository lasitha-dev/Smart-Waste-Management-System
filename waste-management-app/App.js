import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from './src/constants/colors';

// Import all screens
import DashboardScreen from './src/screens/DashboardScreen';
import DataCollectionScreen from './src/screens/DataCollectionScreen';
import DataProcessingScreen from './src/screens/DataProcessingScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import PerformanceMetricsScreen from './src/screens/PerformanceMetricsScreen';
import ReportsScreen from './src/screens/ReportsScreen';

// Import Analytics screens
import AnalyticsDashboard from './src/screens/Analytics/AnalyticsDashboard';
import AnalyticsReportsScreen from './src/screens/Analytics/ReportsScreen';
import KPIsScreen from './src/screens/Analytics/KPIsScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');

  const renderProfileScreen = () => (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => setCurrentScreen('Home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Profile Screen</Text>
        <Text style={styles.description}>
          User profile and settings will be implemented here
        </Text>
      </View>
    </View>
  );

  const renderHomeScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Waste Management</Text>
        <Text style={styles.headerSubtitle}>Choose a module to access</Text>
      </View>
      
      <ScrollView 
        style={styles.modulesContainer}
        contentContainerStyle={styles.modulesContent}
      >
        <TouchableOpacity 
          style={[styles.moduleCard, { backgroundColor: '#2E7D32' }]}
          onPress={() => setCurrentScreen('AnalyticsDashboard')}
        >
          <Text style={styles.moduleIcon}>📊</Text>
          <Text style={styles.moduleTitle}>Analytics & Reporting</Text>
          <Text style={styles.moduleSubtitle}>Data insights and reports</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.moduleCard, { backgroundColor: '#FF9800' }]}
          onPress={() => setCurrentScreen('BinCollection')}
        >
          <Text style={styles.moduleIcon}>🗑️</Text>
          <Text style={styles.moduleTitle}>Bin Collection</Text>
          <Text style={styles.moduleSubtitle}>Collection management</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.moduleCard, { backgroundColor: '#2196F3' }]}
          onPress={() => setCurrentScreen('Scheduling')}
        >
          <Text style={styles.moduleIcon}>📅</Text>
          <Text style={styles.moduleTitle}>Scheduling</Text>
          <Text style={styles.moduleSubtitle}>Pickup scheduling</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.moduleCard, { backgroundColor: '#4CAF50' }]}
          onPress={() => setCurrentScreen('Payments')}
        >
          <Text style={styles.moduleIcon}>💳</Text>
          <Text style={styles.moduleTitle}>Payments</Text>
          <Text style={styles.moduleSubtitle}>Billing and rewards</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderBinCollectionScreen = () => (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: '#FF9800' }]}>
        <TouchableOpacity onPress={() => setCurrentScreen('Home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bin Collection</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Bin Collection Module</Text>
        <Text style={styles.description}>
          This module will be implemented by Athulathmudali A.L.M (IT21129544)
        </Text>
        <Text style={styles.features}>
          Features will include:{'\n'}
          • Route viewing for collection crews{'\n'}
          • Digital bin collection recording{'\n'}
          • Exception reporting
        </Text>
      </View>
    </View>
  );

  const renderSchedulingScreen = () => (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: '#2196F3' }]}>
        <TouchableOpacity onPress={() => setCurrentScreen('Home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scheduling</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Collection Scheduling Module</Text>
        <Text style={styles.description}>
          This module will be implemented by Kumarasinghe S.S (IT22221414)
        </Text>
        <Text style={styles.features}>
          Features will include:{'\n'}
          • Pickup scheduling for residents{'\n'}
          • Different bin types support{'\n'}
          • Service feedback collection
        </Text>
      </View>
    </View>
  );

  const renderPaymentsScreen = () => (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: '#4CAF50' }]}>
        <TouchableOpacity onPress={() => setCurrentScreen('Home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Payments & Rewards Module</Text>
        <Text style={styles.description}>
          This module will be implemented by Sandaru G.A (IT22258908)
        </Text>
        <Text style={styles.features}>
          Features will include:{'\n'}
          • Bill viewing for residents{'\n'}
          • Recycling credit application{'\n'}
          • Integrated payment system
        </Text>
      </View>
    </View>
  );

  const renderCurrentScreen = () => {
    const navigation = {
      navigate: setCurrentScreen,
      goBack: () => setCurrentScreen('Home')
    };

    switch (currentScreen) {
      case 'Home':
        return <DashboardScreen navigation={navigation} onNavigate={setCurrentScreen} />;
      case 'Data':
        return <DataCollectionScreen navigation={navigation} onNavigate={setCurrentScreen} />;
      case 'Reports':
        return <ReportsScreen navigation={navigation} onNavigate={setCurrentScreen} />;
      case 'Profile':
        return renderProfileScreen();
      case 'DataProcessing':
        return <DataProcessingScreen navigation={navigation} onNavigate={setCurrentScreen} />;
      case 'Analysis':
        return <AnalysisScreen navigation={navigation} onNavigate={setCurrentScreen} />;
      case 'PerformanceMetrics':
        return <PerformanceMetricsScreen navigation={navigation} onNavigate={setCurrentScreen} />;
      case 'AnalyticsDashboard':
        return <AnalyticsDashboard navigation={navigation} />;
      case 'AnalyticsReports':
        return <AnalyticsReportsScreen navigation={navigation} />;
      case 'KPIs':
        return <KPIsScreen navigation={navigation} />;
      case 'BinCollection':
        return renderBinCollectionScreen();
      case 'Scheduling':
        return renderSchedulingScreen();
      case 'Payments':
        return renderPaymentsScreen();
      default:
        return <DashboardScreen navigation={navigation} onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderCurrentScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 16,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  modulesContainer: {
    flex: 1,
    padding: 16,
  },
  modulesContent: {
    justifyContent: 'center',
    flexGrow: 1,
  },
  moduleCard: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moduleIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  moduleSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 16,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  features: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
});
