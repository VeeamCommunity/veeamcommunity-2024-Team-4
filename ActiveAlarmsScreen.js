import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const ActiveAlarmsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { alarms } = route.params;

  const renderAlarmItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.alarmItem}
      onPress={() => handleViewAlarmDetails(item)}
    >
      <View style={styles.alarmInfo}>
        <Text style={styles.alarmName}>{item.object?.objectName || 'Unknown Object'}</Text>
        <Text style={styles.alarmMessage}>{item.lastActivation?.message || 'No message'}</Text>
      </View>
      <View style={[styles.alarmStatus, styles[item.lastActivation?.status?.toLowerCase() || 'unknown']]} >
        <Text style={styles.alarmStatusText}>{item.lastActivation?.status || 'Unknown'}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleViewAlarmDetails = (alarm) => {
    alert(`Alarm Details:\n\nObject: ${alarm.object?.objectName || 'Unknown'}\nStatus: ${alarm.lastActivation?.status || 'Unknown'}\nMessage: ${alarm.lastActivation?.message || 'No message'}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Active Alarms</Text>
      </View>
      <FlatList
        data={alarms}
        renderItem={renderAlarmItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
      />
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#004D40',
  },
  backButton: {
    fontSize: 18,
    color: '#FFFFFF',
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alarmInfo: {
    flex: 1,
    marginRight: 16,
  },
  alarmName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alarmMessage: {
    fontSize: 14,
    color: '#666',
  },
  alarmStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  alarmStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  error: {
    backgroundColor: '#FF5252',
  },
  warning: {
    backgroundColor: '#FFA000',
  },
  info: {
    backgroundColor: '#2196F3',
  },
  resolved: {
    backgroundColor: '#4CAF50',
  },
});

export default ActiveAlarmsScreen;
