import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';

console.log('BillingDashboardScreen - Start of file');

const getDimensions = () => {
  try {
    console.log('BillingDashboardScreen - Before Dimensions.get');
    const dimensionsObj = Dimensions.get('window');
    console.log('BillingDashboardScreen - Dimensions.get("window"):', JSON.stringify(dimensionsObj));
    const { width } = dimensionsObj;
    console.log('BillingDashboardScreen - After Dimensions.get, width:', width);
    return { width };
  } catch (error) {
    console.error('BillingDashboardScreen - Error getting dimensions:', error);
    return { width: 0 };
  }
};

const { width } = getDimensions();

const BillingDashboardScreen = () => {
  console.log('BillingDashboardScreen - Component rendering');
  // Mock data
  const storageQuota = { used: 750, total: 1000 }; // GB
  const licensesUsed = 45;
  const totalLicenses = 50;
  const monthlyBilling = [1200, 1350, 1500, 1400, 1600, 1550]; // Last 6 months

  const renderBarChart = (data, maxValue) => {
    return (
      <View style={styles.barChart}>
        {data.map((value, index) => (
          <View key={index} style={styles.barContainer}>
            <View style={[styles.bar, { height: `${(value / maxValue) * 100}%` }]} />
            <Text style={styles.barLabel}>${value}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Billing Dashboard</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Storage Quota Usage</Text>
          <View style={styles.quotaBar}>
            <View style={[styles.quotaUsed, { width: `${(storageQuota.used / storageQuota.total) * 100}%` }]} />
          </View>
          <Text style={styles.quotaText}>
            {storageQuota.used} GB / {storageQuota.total} GB Used
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Licenses Usage</Text>
          <View style={styles.licenseContainer}>
            <View style={styles.licenseBar}>
              <View style={[styles.licenseUsed, { width: `${(licensesUsed / totalLicenses) * 100}%` }]} />
            </View>
            <Text style={styles.licenseText}>
              {licensesUsed} / {totalLicenses} Licenses Used
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Billing (Last 6 Months)</Text>
          {renderBarChart(monthlyBilling, Math.max(...monthlyBilling))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

console.log('BillingDashboardScreen - End of file');

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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#004D40',
  },
  quotaBar: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  quotaUsed: {
    height: '100%',
    backgroundColor: '#004D40',
  },
  quotaText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  licenseContainer: {
    alignItems: 'center',
  },
  licenseBar: {
    width: '100%',
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  licenseUsed: {
    height: '100%',
    backgroundColor: '#004D40',
  },
  licenseText: {
    marginTop: 8,
    color: '#666',
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '80%',
    backgroundColor: '#004D40',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
});

export default BillingDashboardScreen;
