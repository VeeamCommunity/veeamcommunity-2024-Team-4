import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import qs from 'qs';
import { BarChart } from "react-native-gifted-charts";

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [jobStatuses, setJobStatuses] = useState([]);
  const [jobCounts24h, setJobCounts24h] = useState({ success: 0, failed: 0, warning: 0 });
  const [slaStatus, setSlaStatus] = useState(0);
  const [backupPerformance7d, setBackupPerformance7d] = useState([]);

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

          const counts24h = { success: 0, warning: 0, failed: 0 };
          const performanceData7d = {};

          const twentyFourHoursAgo = new Date(currentTime - 24 * 60 * 60 * 1000);
          const sevenDaysAgo = new Date(currentTime - 7 * 24 * 60 * 60 * 1000);

          allJobs.forEach(job => {
            const lastRunTime = new Date(job.lastRun);
            
            // Last 24 hours job counts
            if (lastRunTime >= twentyFourHoursAgo) {
              if (job.status === 'Success' || job.lastStatus === 'Success') {
                counts24h.success += 1;
              } else if (job.status === 'Warning' || job.lastStatus === 'Warning') {
                counts24h.warning += 1;
              } else if (job.status === 'Failed' || job.lastStatus === 'Failed') {
                counts24h.failed += 1;
              }
            }

            // Last 7 days performance data
            if (lastRunTime >= sevenDaysAgo) {
              const dayKey = lastRunTime.toISOString().split('T')[0];
              if (!performanceData7d[dayKey]) {
                performanceData7d[dayKey] = { success: 0, warning: 0, failed: 0 };
              }
              if (job.status === 'Success' || job.lastStatus === 'Success') {
                performanceData7d[dayKey].success += 1;
              } else if (job.status === 'Warning' || job.lastStatus === 'Warning') {
                performanceData7d[dayKey].warning += 1;
              } else if (job.status === 'Failed' || job.lastStatus === 'Failed') {
                performanceData7d[dayKey].failed += 1;
              }
            }
          });

          setJobCounts24h(counts24h);

          const stackData = Object.entries(performanceData7d).map(([date, data]) => ({
            stacks: [
              { value: data.success, color: 'green' },
              { value: data.warning, color: 'orange', marginBottom: 2 },
              { value: data.failed, color: 'red', marginBottom: 2 },
            ],
            label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          }));

          setBackupPerformance7d(stackData);

          // Calculate SLA status
          const totalJobs = counts24h.success + counts24h.warning + counts24h.failed;
          const successfulJobs = counts24h.success + counts24h.warning;
          const sla = totalJobs > 0 ? (successfulJobs / totalJobs) * 100 : 0;
          setSlaStatus(sla.toFixed(2));
        } else {
          throw new Error('Failed to fetch job statuses');
        }
      } catch (error) {
        console.error('Error fetching job statuses:', error);
        Alert.alert('Error', 'Failed to fetch job statuses. Please try again later.');
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
      statusColor = 'orange';
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

  const renderBarChart = () => {
    if (backupPerformance7d.length === 0) {
      return <Text>No data available for chart</Text>;
    }

    try {
      const stackData = backupPerformance7d.map(item => ({
        stacks: [
          { value: Number(item.stacks[0].value) || 0, color: 'green' },
          { value: Number(item.stacks[1].value) || 0, color: 'orange', marginBottom: 2 },
          { value: Number(item.stacks[2].value) || 0, color: 'red', marginBottom: 2 },
        ],
        label: item.label,
      }));

      const maxValue = Math.max(...stackData.map(item => 
        item.stacks.reduce((sum, stack) => sum + stack.value, 0)
      ));

      return (
        <BarChart
          width={screenWidth - 64}
          height={220}
          barWidth={32}
          spacing={20}
          noOfSections={5}
          maxValue={maxValue > 0 ? maxValue : 1}
          stackData={stackData}
          barBorderRadius={4}
          yAxisThickness={0}
          xAxisThickness={0}
          yAxisTextStyle={{ color: '#333' }}
          xAxisLabelTextStyle={{ color: '#333', textAlign: 'center' }}
          yAxisLabelTexts={['0', '25', '50', '75', '100']}
          labelWidth={40}
          xAxisLabelWidth={40}
          rotateLabel
        />
      );
    } catch (error) {
      console.error('Error rendering BarChart:', error);
      return <Text>Error rendering chart</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Backup Performance (Last 7 Days)</Text>
          {renderBarChart()}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: 'green' }]} />
              <Text style={styles.legendText}>Success</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: 'orange' }]} />
              <Text style={styles.legendText}>Warning</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: 'red' }]} />
              <Text style={styles.legendText}>Failed</Text>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardTitle}>SLA Status</Text>
            <Text style={styles.slaText}>{slaStatus}%</Text>
            <Text style={styles.slaSubtext}>Current compliance</Text>
          </View>
          <TouchableOpacity style={[styles.card, styles.halfCard]} onPress={handleShowJobDetails}>
            <Text style={styles.cardTitle}>Job Status 24Hrs</Text>
            <Text style={[styles.jobCountText, { color: 'green' }]}>Success: {jobCounts24h.success}</Text>
            <Text style={[styles.jobCountText, { color: 'orange' }]}>Warning: {jobCounts24h.warning}</Text>
            <Text style={[styles.jobCountText, { color: 'red' }]}>Failed: {jobCounts24h.failed}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cloud Repository Status</Text>
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
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 4,
  },
  tooltipText: {
    color: 'white',
    fontSize: 12,
  },
});


export default DashboardScreen;
