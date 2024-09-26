import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

const JobDetailsScreen = () => {
  const route = useRoute();
  const { jobStatuses } = route.params;

  const renderJobStatus = (job, index) => {
    const lastRunTime = new Date(job.lastRun);
    const currentTime = new Date();
    const isRecent = (currentTime - lastRunTime) / (1000 * 60 * 60) < 24; // within 24 hours
    let statusColor = 'gray';

    if (job.status === 'Success') {
      statusColor = 'green';
    } else if (job.status === 'Warning') {
      statusColor = 'yellow';
    } else if (job.status === 'Failed') {
      statusColor = 'red';
    }

    return (
      <View key={index} style={styles.jobStatusContainer}>
        <Text style={[styles.jobStatusText, { color: statusColor }]}>
          {job.name}: {job.status} {isRecent ? '(Recent)' : ''}
        </Text>
        <Text style={styles.jobStatusSubText}>Last Run: {lastRunTime.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {jobStatuses.map(renderJobStatus)}
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
  jobStatusContainer: {
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
  jobStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobStatusSubText: {
    fontSize: 12,
    color: '#666',
  },
});

export default JobDetailsScreen;
