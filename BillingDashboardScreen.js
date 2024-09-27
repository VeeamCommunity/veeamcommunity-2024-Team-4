import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BillingDashboardScreen = () => {
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0 });
  const [licenseUsage, setLicenseUsage] = useState({ server: 0, workstation: 0, vm: 0 });
  const [monthlyBilling, setMonthlyBilling] = useState([1200, 1350, 1500, 1400, 1600, 1550]); // Placeholder data

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await axios.get(`${baseUrl}/organizations/companies/sites/backupResources/usage`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.status >= 200 && response.status < 300) {
        const data = response.data.data[0];
        setStorageUsage({
          used: data.usedStorageQuota,
          total: data.storageQuota
        });
        setLicenseUsage({
          server: data.serverBackups,
          workstation: data.workstationBackups,
          vm: data.vmBackups
        });
      } else {
        throw new Error('Failed to fetch usage data');
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
      Alert.alert('Error', 'Failed to fetch usage data. Please try again later.');
    }
  };

  const bytesToSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  const renderStorageQuotaUsage = () => {
    const usedPercentage = (storageUsage.used / storageUsage.total) * 100;
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Storage Quota Usage</Text>
        <View style={styles.quotaBar}>
          <View style={[styles.quotaUsed, { width: `${usedPercentage}%` }]} />
        </View>
        <Text style={styles.quotaText}>
          {bytesToSize(storageUsage.used)} / {bytesToSize(storageUsage.total)} Used
        </Text>
      </View>
    );
  };

  const renderLicensesUsage = () => {
    const totalLicenses = licenseUsage.server + licenseUsage.workstation + licenseUsage.vm;
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Licenses Usage</Text>
        <View style={styles.licenseContainer}>
          <Text style={styles.licenseText}>Server Backups: {licenseUsage.server}</Text>
          <Text style={styles.licenseText}>Workstation Backups: {licenseUsage.workstation}</Text>
          <Text style={styles.licenseText}>VM Backups: {licenseUsage.vm}</Text>
          <Text style={styles.licenseTotalText}>Total Licenses: {totalLicenses}</Text>
        </View>
      </View>
    );
  };

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

        {renderStorageQuotaUsage()}
        {renderLicensesUsage()}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Billing (Last 6 Months)</Text>
          {renderBarChart(monthlyBilling, Math.max(...monthlyBilling))}
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
    marginTop: 8,
  },
  licenseText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  licenseTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004D40',
    marginTop: 8,
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
