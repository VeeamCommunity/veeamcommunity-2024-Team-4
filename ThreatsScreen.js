import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

console.log('ThreatsScreen - Start of file');

const getDimensions = () => {
  try {
    console.log('ThreatsScreen - Before Dimensions.get');
    const dimensionsObj = Dimensions.get('window');
    console.log('ThreatsScreen - Dimensions.get("window"):', JSON.stringify(dimensionsObj));
    const { width } = dimensionsObj;
    console.log('ThreatsScreen - After Dimensions.get, width:', width);
    return { width };
  } catch (error) {
    console.error('ThreatsScreen - Error getting dimensions:', error);
    return { width: 0 };
  }
};

const { width } = getDimensions();

const ThreatsScreen = () => {
  console.log('ThreatsScreen - Component rendering');
  const navigation = useNavigation();
  const threats = [
    { id: 1, name: 'Infected Backup', severity: 'Critical', date: '2023-10-01' },
    { id: 2, name: 'Suspicious Backup', severity: 'High', date: '2023-09-28' },
    { id: 3, name: 'Yara Threat Hunt', severity: 'Medium', date: '2023-09-25' },
  ];

  const renderThreat = (threat) => (
    <View key={threat.id} style={styles.threatItem}>
      <View>
        <Text style={styles.threatName}>{threat.name}</Text>
        <Text style={styles.threatDate}>Detected on: {threat.date}</Text>
      </View>
      <View style={styles.threatRight}>
        <Text style={[styles.threatSeverity, styles[threat.severity.toLowerCase()]]}>
          {threat.severity}
        </Text>
        <TouchableOpacity style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Summary</Text>
        <View style={styles.chartsContainer}>
          <View style={styles.chartBox}>
            <View style={styles.pieChart} />
          </View>
          <View style={styles.chartBox}>
            <View style={styles.lineGraph}>
              {[60, 80, 40, 90, 70].map((height, index) => (
                <View key={index} style={[styles.lineBar, { height: `${height}%` }]} />
              ))}
            </View>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Detected Threats</Text>
        <View style={styles.threatsList}>
          {threats.map(renderThreat)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  chartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  chartBox: {
    width: width * 0.43,
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pieChart: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: '#2196F3',
  },
  lineGraph: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
  lineBar: {
    width: '15%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  threatsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  threatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  threatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  threatDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  threatRight: {
    alignItems: 'flex-end',
  },
  threatSeverity: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  critical: {
    color: '#FFFFFF',
    backgroundColor: '#FF5252',
  },
  high: {
    color: '#FFFFFF',
    backgroundColor: '#FFA000',
  },
  medium: {
    color: '#000000',
    backgroundColor: '#FFC107',
  },
  viewDetailsButton: {
    backgroundColor: '#004D40',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

console.log('ThreatsScreen - End of file');

export default ThreatsScreen;
