import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { PieChart } from "react-native-gifted-charts";
import qs from 'qs';

const { width } = Dimensions.get('window');

const ThreatsScreen = () => {
  const navigation = useNavigation();
  const [threats, setThreats] = useState([]);
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [alarmStats, setAlarmStats] = useState({ Error: 0, Warning: 0, Info: 0, Resolved: 0 });

  useEffect(() => {
    fetchThreats();
    fetchActiveAlarms();
  }, []);

  const fetchThreats = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      let accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const expiresIn = await AsyncStorage.getItem('expiresIn');
      const currentTime = new Date().getTime();

      if (currentTime >= parseInt(expiresIn)) {
        // Token expired, refresh it
        const response = await axios.post(`${baseUrl}/token`, 
          qs.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken }), 
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        if (response.status >= 200 && response.status < 300) {
          accessToken = response.data.access_token;
          const newExpiresIn = new Date().getTime() + response.data.expires_in * 1000;
          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('expiresIn', newExpiresIn.toString());
        } else {
          throw new Error('Failed to refresh token');
        }
      }

      const response = await axios.get(`${baseUrl}/protectedWorkloads/virtualMachines`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.status >= 200 && response.status < 300) {
        const detectedThreats = response.data.data.filter(vm => 
          vm.malwareState === 'Infected' || vm.malwareState === 'Suspicious'
        ).map(vm => ({
          id: vm.instanceUid,
          name: vm.name,
          severity: vm.malwareState === 'Infected' ? 'Critical' : 'High',
          date: vm.latestRestorePointDate,
          malwareState: vm.malwareState,
          ipAddresses: vm.ipAddresses || []
        }));
        setThreats(detectedThreats);
      } else {
        throw new Error('Failed to fetch threats');
      }
    } catch (error) {
      console.error('Error fetching threats:', error);
      Alert.alert('Error', 'Failed to fetch threats. Please try again later.');
    }
  };

  const fetchActiveAlarms = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      let accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const expiresIn = await AsyncStorage.getItem('expiresIn');
      const currentTime = new Date().getTime();

      if (currentTime >= parseInt(expiresIn)) {
        // Token expired, refresh it
        const response = await axios.post(`${baseUrl}/token`, 
          qs.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken }), 
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        if (response.status >= 200 && response.status < 300) {
          accessToken = response.data.access_token;
          const newExpiresIn = new Date().getTime() + response.data.expires_in * 1000;
          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('expiresIn', newExpiresIn.toString());
        } else {
          throw new Error('Failed to refresh token');
        }
      }

      const response = await axios.get(`${baseUrl}/alarms/active`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.status >= 200 && response.status < 300) {
        setActiveAlarms(response.data.data);
        calculateAlarmStats(response.data.data);
      } else {
        throw new Error('Failed to fetch active alarms');
      }
    } catch (error) {
      console.error('Error fetching active alarms:', error);
      Alert.alert('Error', 'Failed to fetch active alarms. Please try again later.');
    }
  };

  const calculateAlarmStats = (alarms) => {
    const stats = { Error: 0, Warning: 0, Info: 0, Resolved: 0 };
    alarms.forEach(alarm => {
      stats[alarm.lastActivation.status]++;
    });
    setAlarmStats(stats);
  };

  const handleViewDetails = (threat) => {
    Alert.alert(
      'Threat Details',
      `Name: ${threat.name}\n` +
      `IP Addresses: ${threat.ipAddresses.length > 0 ? threat.ipAddresses.join(', ') : 'None'}\n` +
      `Malware State: ${threat.malwareState}`,
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
  };

  const renderThreat = (threat) => (
    <View key={threat.id} style={styles.threatItem}>
      <View style={styles.threatInfo}>
        <Text style={styles.threatName}>{threat.name}</Text>
        <Text style={styles.threatDate}>Detected on: {new Date(threat.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.threatRight}>
        <Text style={[styles.threatSeverity, styles[threat.severity.toLowerCase()]]}>
          {threat.severity}
        </Text>
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => handleViewDetails(threat)}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAlarmPieChart = () => {
    const pieData = [
      { value: alarmStats.Error || 0, color: '#FF5252', text: 'Error' },
      { value: alarmStats.Warning || 0, color: '#FFA000', text: 'Warning' },
      { value: alarmStats.Info || 0, color: '#2196F3', text: 'Info' },
      { value: alarmStats.Resolved || 0, color: '#4CAF50', text: 'Resolved' },
    ];

    const totalAlarms = activeAlarms.length;

    return (
      <TouchableOpacity 
        style={styles.chartContainer}
        onPress={() => navigation.navigate('ActiveAlarms', { alarms: activeAlarms })}
      >
        <Text style={styles.chartTitle}>Active Alarms</Text>
        <View style={styles.chartContent}>
          <PieChart
            data={pieData.filter(item => item.value > 0)}
            donut
            radius={width * 0.2}
            innerRadius={width * 0.15}
            innerCircleColor={'#FFFFFF'}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={styles.centerLabelBig}>{totalAlarms}</Text>
                <Text style={styles.centerLabelSmall}>Total</Text>
              </View>
            )}
          />
          <View style={styles.legendContainer}>
            {pieData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.text}: {item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Threat Dashboard</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => { fetchThreats(); fetchActiveAlarms(); }}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.chartsContainer}>
          {renderAlarmPieChart()}
        </View>
        <Text style={styles.sectionTitle}>Detected Threats</Text>
        <View style={styles.threatsList}>
          {threats.length > 0 ? (
            threats.map(renderThreat)
          ) : (
            <Text style={styles.noThreatsText}>No threats detected</Text>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#004D40',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  chartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  chartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  legendContainer: {
    flex: 1,
    marginLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabelBig: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  centerLabelSmall: {
    fontSize: 14,
    color: '#666',
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
  threatInfo: {
    flex: 1,
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
  noThreatsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 16,
  },
});

export default ThreatsScreen;
