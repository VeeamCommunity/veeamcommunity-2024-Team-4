import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

console.log('ServiceProviderDashboardScreen - Start of file');

const ServiceProviderDashboardScreen = () => {
  console.log('ServiceProviderDashboardScreen - Component rendering');
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  console.log('ServiceProviderDashboardScreen - Screen width:', width);

  // Mock data for customers and statistics
  const customers = [
    { id: 1, name: 'Customer A', status: 'Healthy', dataProtected: 5.2 },
    { id: 2, name: 'Customer B', status: 'Warning', dataProtected: 3.8 },
    { id: 3, name: 'Customer C', status: 'Critical', dataProtected: 2.1 },
    { id: 4, name: 'Customer D', status: 'Healthy', dataProtected: 4.5 },
    { id: 5, name: 'Customer E', status: 'Healthy', dataProtected: 6.3 },
  ];

  const totalCustomers = customers.length;
  const totalDataProtected = customers.reduce((sum, customer) => sum + customer.dataProtected, 0).toFixed(1);

  const renderBarChart = () => {
    const maxValue = Math.max(...customers.map(c => c.dataProtected));
    return (
      <View style={styles.chartContainer}>
        {customers.map((customer) => (
          <View key={customer.id} style={styles.barContainer}>
            <View style={[styles.bar, { height: (customer.dataProtected / maxValue) * 150 }]} />
            <Text style={styles.barLabel}>{customer.name}</Text>
          </View>
        ))}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    header: {
      backgroundColor: '#004D40',
      padding: 16,
    },
    headerText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    scrollContent: {
      padding: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 24,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#004D40',
    },
    statLabel: {
      fontSize: 14,
      color: '#666',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#333',
    },
    chartContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 200,
      marginBottom: 24,
    },
    barContainer: {
      alignItems: 'center',
      width: width / 6,
    },
    bar: {
      width: 20,
      backgroundColor: '#004D40',
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
    barLabel: {
      fontSize: 12,
      color: '#666',
      marginTop: 4,
    },
    customerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#fff',
      borderRadius: 8,
      marginBottom: 8,
      elevation: 2,
    },
    customerName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    customerDetails: {
      alignItems: 'flex-end',
    },
    customerStatus: {
      fontSize: 12,
      fontWeight: 'bold',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginBottom: 4,
    },
    customerData: {
      fontSize: 12,
      color: '#666',
    },
    healthy: {
      color: '#4CAF50',
      backgroundColor: '#E8F5E9',
    },
    warning: {
      color: '#FFC107',
      backgroundColor: '#FFF8E1',
    },
    critical: {
      color: '#F44336',
      backgroundColor: '#FFEBEE',
    },
  });

  console.log('ServiceProviderDashboardScreen - Styles created');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Remove the custom header here */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCustomers}</Text>
            <Text style={styles.statLabel}>Total Customers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalDataProtected} TB</Text>
            <Text style={styles.statLabel}>Data Protected</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Data Protection by Customer</Text>
        {renderBarChart()}

        <Text style={styles.sectionTitle}>Customer Overview</Text>
        {customers.map((customer) => (
          <TouchableOpacity key={customer.id} style={styles.customerItem}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <View style={styles.customerDetails}>
              <Text style={[styles.customerStatus, styles[customer.status.toLowerCase()]]}>
                {customer.status}
              </Text>
              <Text style={styles.customerData}>{customer.dataProtected} TB</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

console.log('ServiceProviderDashboardScreen - End of file');

export default ServiceProviderDashboardScreen;
