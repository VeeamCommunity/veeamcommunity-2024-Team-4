import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import qs from 'qs';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [jobStatuses, setJobStatuses] = useState([]);
  const [jobCounts, setJobCounts] = useState({ success: 0, failed: 0, warning: 0 });
  const [slaStatus, setSlaStatus] = useState(0);

  useEffect(() => {
    const fetchJobStatuses = async () => {
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

        const [jobResponse, agentJobResponse, vb365JobResponse] = await Promise.all([
          axios.get(`${baseUrl}/infrastructure/backupServers/jobs`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          }),
          axios.get(`${baseUrl}/infrastructure/backupAgents/jobs`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          }),
          axios.get(`${baseUrl}/infrastructure/vb365Servers/organizations/jobs`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
        ]);

        if (jobResponse.status >= 200 && jobResponse.status < 300 && agentJobResponse.status >= 200 && agentJobResponse.status < 300 && vb365JobResponse.status >= 200 && vb365JobResponse.status < 300) {
          const jobs = jobResponse.data.data;
          const agentJobs = agentJobResponse.data.data;
          const vb365Jobs = vb365JobResponse.data.data;
          const allJobs = [...jobs, ...agentJobs, ...vb365Jobs];
          setJobStatuses(allJobs);

          // Calculate job counts
          const counts = { success: 0, failed: 0, warning: 0 };
          const currentTime = new Date();
          allJobs.forEach(job => {
            const lastRunTime = new Date(job.lastRun);
            const isRecent = (currentTime - lastRunTime) / (1000 * 60 * 60) < 24; // within 24 hours
            if (isRecent) {
              if (job.status === 'Success' || job.lastStatus === 'Success') {
                counts.success += 1;
              } else if (job.status === 'Warning' || job.lastStatus === 'Warning') {
                counts.warning += 1;
              } else if (job.status === 'Failed' || job.lastStatus === 'Failed') {
                counts.failed += 1;
              }
            }
          });
          setJobCounts(counts);

          // Calculate SLA status
          const totalJobs = counts.success + counts.warning + counts.failed;
          const successfulJobs = counts.success + counts.warning;
          const sla = totalJobs > 0 ? (successfulJobs / totalJobs) * 100 : 0;
          setSlaStatus(sla.toFixed(2));
        } else {
          throw new Error('Failed to fetch job statuses');
        }
      } catch (error) {
        console.error('Error fetching job statuses:', error);
        Alert.alert('Error', 'Failed to fetch job statuses');
      }
    };

    fetchJobStatuses();
  }, []);

  const renderJobStatus = (job, index) => {
    const lastRunTime = new Date(job.lastRun);
    const currentTime = new Date();
    const isRecent = (currentTime - lastRunTime) / (1000 * 60 * 60) < 24; // within 24 hours
    let statusColor = 'gray';

    if (job.status === 'Success' || job.lastStatus === 'Success') {
      statusColor = 'green';
    } else if (job.status === 'Warning' || job.lastStatus === 'Warning') {
      statusColor = 'yellow';
    } else if (job.status === 'Failed' || job.lastStatus === 'Failed') {
      statusColor = 'red';
    }

    return (
      <View key={index} style={styles.jobStatusContainer}>
        <Text style={[styles.jobStatusText, { color: statusColor }]}>
          {job.name}: {job.status || job.lastStatus} {isRecent ? '(Recent)' : ''}
        </Text>
        <Text style={styles.jobStatusSubText}>Last Run: {lastRunTime.toLocaleString()}</Text>
      </View>
    );
  };

  const handleShowJobDetails = () => {
    navigation.navigate('JobDetails', { jobStatuses });
  };

  const handleShowThreatCenter = () => {
    navigation.navigate('Threats');  // Changed from 'ThreatCenter' to 'Threats'
  };

  const handleShowBillingDashboard = () => {
    navigation.navigate('BillingDashboard');
  };

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        colors: [
          (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Red
          (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, // Green
          (opacity = 1) => `rgba(255, 255, 0, ${opacity})`, // Yellow
          (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, // Green
          (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Red
          (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, // Green
        ],
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Backup Performance (Last 6 Months)</Text>
          <BarChart
            data={data}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            fromZero
            showBarTops={false}
            showValuesOnTopOfBars
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardTitle}>SLA Status</Text>
            <Text style={styles.slaText}>{slaStatus}%</Text>
            <Text style={styles.slaSubtext}>Current compliance</Text>
          </View>
          <TouchableOpacity style={[styles.card, styles.halfCard]} onPress={handleShowJobDetails}>
            <Text style={styles.cardTitle}>Job Statuses</Text>
            <Text style={[styles.jobCountText, { color: 'green' }]}>Success: {jobCounts.success}</Text>
            <Text style={[styles.jobCountText, { color: 'yellow' }]}>Warning: {jobCounts.warning}</Text>
            <Text style={[styles.jobCountText, { color: 'red' }]}>Failed: {jobCounts.failed}</Text>
          </TouchableOpacity>
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  jobStatusContainer: {
    marginBottom: 8,
  },
  jobStatusText: {
    fontSize: 16,
  },
  jobStatusSubText: {
    fontSize: 12,
    color: '#666',
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
  jobCountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});


export default DashboardScreen;
