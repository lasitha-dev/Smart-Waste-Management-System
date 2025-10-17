/**
 * SchedulePickup Screen
 * Main screen for selecting bins and initiating waste collection scheduling
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module SchedulePickupScreen
 */

import React, { useState } from 'react';
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

/**
 * SchedulePickup Screen Component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 */
const SchedulePickupScreen = ({ navigation }) => {
  const [selectedBins, setSelectedBins] = useState([]);
  
  const bins = [
    { id: '1', type: 'General Waste', location: 'Kitchen', currentFillLevel: 75, icon: '🗑️' },
    { id: '2', type: 'Recyclable', location: 'Garage', currentFillLevel: 60, icon: '♻️' },
    { id: '3', type: 'Organic Waste', location: 'Backyard', currentFillLevel: 85, icon: '🍂' },
  ];

  /**
   * Toggles bin selection
   */
  const toggleBinSelection = (binId) => {
    setSelectedBins(prev => {
      if (prev.includes(binId)) {
        return prev.filter(id => id !== binId);
      } else {
        return [...prev, binId];
      }
    });
  };

  /**
   * Handles next button press
   */
  const handleNext = () => {
    if (selectedBins.length === 0) {
      Alert.alert('No Bins Selected', 'Please select at least one bin to continue');
      return;
    }
    
    // Navigate to date/time selection
    navigation.navigate('SelectDateTime', { selectedBins });
  };

  /**
   * Renders bin card
   */
  const renderBinCard = (bin) => {
    const isSelected = selectedBins.includes(bin.id);
    const needsUrgent = bin.currentFillLevel > 80;

    return (
      <TouchableOpacity
        key={bin.id}
        style={[
          styles.binCard,
          isSelected && styles.binCardSelected,
          needsUrgent && styles.binCardUrgent
        ]}
        onPress={() => toggleBinSelection(bin.id)}
      >
        <View style={styles.binHeader}>
          <Text style={styles.binIcon}>{bin.icon}</Text>
          {needsUrgent && <Text style={styles.urgentBadge}>URGENT</Text>}
        </View>
        
        <Text style={styles.binType}>{bin.type}</Text>
        <Text style={styles.binLocation}>📍 {bin.location}</Text>
        
        <View style={styles.fillLevelContainer}>
          <Text style={styles.fillLevelLabel}>Fill Level</Text>
          <View style={styles.fillLevelBar}>
            <View
              style={[
                styles.fillLevelProgress,
                {
                  width: `${bin.currentFillLevel}%`,
                  backgroundColor: bin.currentFillLevel > 80 ? '#F44336' :
                                 bin.currentFillLevel > 50 ? '#FF9800' : '#4CAF50'
                }
              ]}
            />
          </View>
          <Text style={styles.fillLevelText}>{bin.currentFillLevel}%</Text>
        </View>

        <View style={styles.selectionIndicator}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.selectionText}>
            {isSelected ? 'Selected' : 'Select for pickup'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Pickup</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <Text style={styles.progressLabel}>Select Bins</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={styles.progressDot} />
          <Text style={styles.progressLabel}>Date & Time</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={styles.progressDot} />
          <Text style={styles.progressLabel}>Confirm</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsIcon}>📋</Text>
          <Text style={styles.instructionsTitle}>Select bins for collection</Text>
          <Text style={styles.instructionsText}>
            Choose one or more bins you want to schedule for pickup
          </Text>
        </View>

        <View style={styles.binsContainer}>
          {bins.map(bin => renderBinCard(bin))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {selectedBins.length} bin(s) selected
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedBins.length === 0 && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={selectedBins.length === 0}
        >
          <Text style={styles.nextButtonText}>Next: Select Date & Time</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  backButton: {
    padding: 8
  },
  backIcon: {
    fontSize: 24,
    color: '#2E7D32'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  placeholder: {
    width: 40
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5'
  },
  progressStep: {
    alignItems: 'center'
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressDotActive: {
    backgroundColor: '#2E7D32'
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
    marginBottom: 24
  },
  progressLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    maxWidth: 60
  },
  content: {
    flex: 1,
    padding: 16
  },
  instructionsCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center'
  },
  instructionsIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  binsContainer: {
    gap: 16
  },
  binCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  binCardSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9'
  },
  binCardUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336'
  },
  binHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  binIcon: {
    fontSize: 32
  },
  urgentBadge: {
    backgroundColor: '#F44336',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  binType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  binLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  fillLevelContainer: {
    marginBottom: 12
  },
  fillLevelLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  fillLevelBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4
  },
  fillLevelProgress: {
    height: '100%',
    borderRadius: 4
  },
  fillLevelText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right'
  },
  selectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E7D32',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxSelected: {
    backgroundColor: '#2E7D32'
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  selectionText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600'
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF'
  },
  summaryContainer: {
    marginBottom: 12
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  nextButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  nextButtonDisabled: {
    backgroundColor: '#E0E0E0'
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default SchedulePickupScreen;
