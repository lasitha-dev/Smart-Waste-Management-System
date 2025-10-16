import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors } from '../constants/colors';
import { dimensions } from '../constants/dimensions';
import BottomNavigationBar from '../components/BottomNavigationBar';

const ReportsScreen = ({ navigation, onNavigate }) => {
  const [selectedTab, setSelectedTab] = useState('Billing');
  const [selectedExport, setSelectedExport] = useState('CSV');

  const tabs = ['operational', 'Billing', 'Recycling'];
  const exportFormats = ['PDF', 'CSV', 'Excel'];

  const reportData = [
    { day: 'Mon', value: 130 },
    { day: 'Tue', value: 180 },
    { day: 'Wed', value: 150 },
    { day: 'Thu', value: 220 },
    { day: 'Fri', value: 200 },
    { day: 'Sat', value: 300 },
    { day: 'Sun', value: 280 },
  ];

  const maxReportValue = Math.max(...reportData.map(item => item.value));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.activeTab
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Export Options */}
        <View style={styles.exportContainer}>
          {exportFormats.map((format) => (
            <TouchableOpacity
              key={format}
              style={[
                styles.exportButton,
                selectedExport === format && styles.activeExportButton
              ]}
              onPress={() => setSelectedExport(format)}
            >
              <Text style={[
                styles.exportText,
                selectedExport === format && styles.activeExportText
              ]}>
                {format}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filtersRow}>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>Date</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>City</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>route</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterIconButton}>
              <Text style={styles.filterIcon}>🔽</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.clearFiltersButton}>
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Report View */}
        <View style={styles.reportSection}>
          <Text style={styles.reportTitle}>Report View</Text>
          
          {/* Line Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {reportData.map((item, index) => {
                const height = (item.value / maxReportValue) * 100;
                return (
                  <View key={index} style={styles.chartBarContainer}>
                    <View
                        style={[
                          styles.chartBar,
                          { height: `${height}%`, backgroundColor: '#2E7D32' }
                        ]}
                    />
                    <Text style={styles.chartBarLabel}>{item.day}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.chartYAxis}>
              <Text style={styles.chartYLabel}>300</Text>
              <Text style={styles.chartYLabel}>250</Text>
              <Text style={styles.chartYLabel}>200</Text>
              <Text style={styles.chartYLabel}>150</Text>
              <Text style={styles.chartYLabel}>100</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
          </Text>

          {/* Pie Chart and Additional Data */}
          <View style={styles.additionalDataContainer}>
            <View style={styles.pieChartContainer}>
              <View style={styles.pieChart}>
                <Text style={styles.pieChartText}>Pie</Text>
              </View>
            </View>
            <View style={styles.dataTextContainer}>
              <Text style={styles.dataText}>Data analysis results</Text>
              <Text style={styles.dataText}>Performance metrics</Text>
              <Text style={styles.dataText}>Trend analysis</Text>
              <TouchableOpacity style={styles.viewMoreButton}>
                <Text style={styles.viewMoreText}>view more</Text>
                <Text style={styles.viewMoreArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonIcon}>⬇️</Text>
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonIcon}>👁️</Text>
            <Text style={styles.actionButtonText}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonIcon}>📤</Text>
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavigationBar currentScreen="Reports" onNavigate={onNavigate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingHorizontal: dimensions.padding,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 24,
    color: colors.surface,
    fontWeight: 'bold',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.surface,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: dimensions.padding,
    marginTop: 20,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2E7D32',
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  exportContainer: {
    flexDirection: 'row',
    marginHorizontal: dimensions.padding,
    marginBottom: 20,
  },
  exportButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeExportButton: {
    backgroundColor: colors.primary,
  },
  exportText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeExportText: {
    color: colors.surface,
    fontWeight: 'bold',
  },
  filtersContainer: {
    marginHorizontal: dimensions.padding,
    marginBottom: 20,
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    color: colors.text,
  },
  dropdownIcon: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  filterIconButton: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 16,
    color: colors.text,
  },
  clearFiltersButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearFiltersText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  reportSection: {
    marginHorizontal: dimensions.padding,
    marginBottom: 24,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: 16,
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 24,
    backgroundColor: '#2E7D32',
    borderRadius: 3,
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  chartYAxis: {
    width: 40,
    height: 120,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartYLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  additionalDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pieChartContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pieChart: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieChartText: {
    fontSize: 12,
    color: colors.surface,
    fontWeight: 'bold',
  },
  dataTextContainer: {
    flex: 1,
  },
  dataText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 12,
    color: colors.primary,
    marginRight: 4,
  },
  viewMoreArrow: {
    fontSize: 10,
    color: colors.primary,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: dimensions.padding,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default ReportsScreen;
