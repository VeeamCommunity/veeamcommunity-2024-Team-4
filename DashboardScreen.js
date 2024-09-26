import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

console.log('DashboardScreen - Start of file');

const DashboardScreen = () => {
  console.log('DashboardScreen - Component rendering');
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  console.log('DashboardScreen - Screen width:', screenWidth);

  const data = [20, 45, 28, 80, 99, 43];
  const maxValue = Math.max(...data);

  const renderBar = (value, index) => {
    const barWidth = (value / maxValue) * (screenWidth - 120); // Adjusted for padding and text
    return (
      <View key={index} style={styles.barContainer}>
        <Text style={styles.barText}>{value}</Text>
        <View style={[styles.bar, { width: barWidth }]} />
      </View>
    );
  };

  const handleShowThreatCenter = () => {
    navigation.navigate('Threats');
  };

  const handleShowBillingDashboard = () => {
    navigation.navigate('BillingDashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Remove the custom header here */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Backup Performance (Last 6 Months)</Text>
          <View style={styles.chartContainer}>
            {data.map(renderBar)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardTitle}>SLA Status</Text>
            <Text style={styles.slaText}>98.5%</Text>
            <Text style={styles.slaSubtext}>Current compliance</Text>
          </View>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardTitle}>Job Statuses</Text>
            <View style={styles.jobStatusContainer}>
              <Text style={styles.jobStatusText}>Successful: <Text style={styles.success}>45</Text></Text>
              <Text style={styles.jobStatusText}>Failed: <Text style={styles.failed}>5</Text></Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Backup Repository Status</Text>
          <View style={styles.spaceContainer}>
            <View style={styles.spaceBar}>
              <View style={[styles.spaceUsed, { width: '30%' }]} />
            </View>
            <View style={styles.spaceTextContainer}>
              <Text style={styles.spaceText}>Used: <Text style={styles.usedSpace}>1.2 TB</Text></Text>
              <Text style={styles.spaceText}>Free: <Text style={styles.freeSpace}>2.8 TB</Text></Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShowThreatCenter}>
            <Text style={styles.actionButtonText}>Show Threat Center</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShowBillingDashboard}>
            <Text style={styles.actionButtonText}>Billing Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

console.log('DashboardScreen - End of file');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#004D40',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    width: '48%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#004D40',
  },
  chartContainer: {
    padding: 10,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bar: {
    height: 20,
    backgroundColor: 'rgb(134, 65, 244)',
    borderRadius: 10,
  },
  barText: {
    fontSize: 12,
    width: 30,
    marginRight: 5,
    textAlign: 'right',
  },
  slaText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#004D40',
    textAlign: 'center',
  },
  slaSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  jobStatusContainer: {
    alignItems: 'center',
  },
  jobStatusText: {
    fontSize: 16,
    marginBottom: 4,
  },
  success: {
    color: 'green',
  },
  failed: {
    color: 'red',
  },
  spaceContainer: {
    marginTop: 8,
  },
  spaceBar: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  spaceUsed: {
    height: '100%',
    backgroundColor: '#004D40',
  },
  spaceTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  spaceText: {
    fontSize: 14,
  },
  usedSpace: {
    color: 'red',
  },
  freeSpace: {
    color: 'green',
  },
  actionButton: {
    backgroundColor: '#004D40',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default DashboardScreen;
