import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const BillingDashboardScreen = () => {
  const [usageData, setUsageData] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const accessToken = await AsyncStorage.getItem('accessToken');

      const headers = { Authorization: `Bearer ${accessToken}` };

      const usageResponse = await axios.get(`${baseUrl}/organizations/companies/usage`, { headers });
      setUsageData(processUsageData(usageResponse.data.data[0].counters));
    } catch (error) {
      console.error('Error fetching usage data:', error);
      Alert.alert('Error', 'Failed to fetch usage data. Please try again later.');
    }
  };

  const processUsageData = (counters) => {
    return {
      backups: {
        vm: findCounterValue(counters, 'VmCloudBackups'),
        server: findCounterValue(counters, 'ServerCloudBackups'),
        workstation: findCounterValue(counters, 'WorkstationCloudBackups'),
      },
      dataTransfer: {
        agentIn: findCounterValue(counters, 'AgentCloudBackupDataTransferIn'),
        agentOut: findCounterValue(counters, 'AgentCloudBackupDataTransferOut'),
        vbrIn: findCounterValue(counters, 'VbrCloudBackupsDataTransferIn'),
        vbrOut: findCounterValue(counters, 'VbrCloudBackupsDataTransferOut'),
      },
      cloudReplicas: {
        count: findCounterValue(counters, 'VmCloudReplicas'),
        computeTime: findCounterValue(counters, 'VmCloudReplicaComputeTime'),
        storageUsage: findCounterValue(counters, 'VmCloudReplicaStorageUsage'),
        dataIn: findCounterValue(counters, 'VbrCloudReplicaDataTransferIn'),
        dataOut: findCounterValue(counters, 'VbrCloudReplicaDataTransferOut'),
      },
      cloudRepositoryUsage: {
        vm: findCounterValue(counters, 'CloudRepositoryUsageByVm'),
        serverAgent: findCounterValue(counters, 'CloudRepositoryUsageByServerAgent'),
        workstationAgent: findCounterValue(counters, 'CloudRepositoryUsageByWorkstationAgent'),
      },
      managedResources: {
        serverAgents: findCounterValue(counters, 'ManagedServerAgents'),
        workstationAgents: findCounterValue(counters, 'ManagedWorkstationAgents'),
        vms: findCounterValue(counters, 'ManagedVms'),
        cloudVms: findCounterValue(counters, 'ManagedCloudVms'),
      },
      fileShares: {
        archiveSize: findCounterValue(counters, 'FileShareArchiveSize'),
        backupSize: findCounterValue(counters, 'FileShareBackupSize'),
        sourceSize: findCounterValue(counters, 'FileShareSourceSize'),
        protected: findCounterValue(counters, 'ProtectedFileShares'),
      },
      objectStorage: {
        archiveSize: findCounterValue(counters, 'ObjectStorageArchiveSize'),
        backupSize: findCounterValue(counters, 'ObjectStorageBackupSize'),
        sourceSize: findCounterValue(counters, 'ObjectStorageSourceSize'),
        protected: findCounterValue(counters, 'ProtectedObjectStorages'),
      },
      cloudStorage: {
        total: findCounterValue(counters, 'CloudTotalUsage'),
        regular: findCounterValue(counters, 'CloudRegularStorageUsage'),
        object: findCounterValue(counters, 'CloudObjectStorageUsage'),
      },
      vms: {
        replicated: findCounterValue(counters, 'ReplicatedVms'),
        backedUp: findCounterValue(counters, 'BackedupVms'),
      },
      o365: {
        archiveSize: findCounterValue(counters, 'Vb365ArchiveSize'),
        backupSize: findCounterValue(counters, 'Vb365BackupSize'),
        protectedGroups: findCounterValue(counters, 'Vb365ProtectedGroups'),
        protectedSites: findCounterValue(counters, 'Vb365ProtectedSites'),
        protectedTeams: findCounterValue(counters, 'Vb365ProtectedTeams'),
        protectedUsers: findCounterValue(counters, 'Vb365ProtectedUsers'),
      },
    };
  };

  const findCounterValue = (counters, type) => {
    const counter = counters.find(c => c.type === type);
    return counter ? counter.value : 0;
  };

  const bytesToSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({ ...prev, [cardName]: !prev[cardName] }));
  };

  const renderCard = (title, content, cardName) => {
    const isExpanded = expandedCards[cardName];
    return (
      <TouchableOpacity style={styles.card} onPress={() => toggleCard(cardName)}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Icon name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color="#004D40" />
        </View>
        {isExpanded && content}
      </TouchableOpacity>
    );
  };

  const renderBackupsChart = () => {
    if (!usageData) return null;
    const data = [
      { value: usageData.backups.vm, label: 'VM', frontColor: '#177AD5' },
      { value: usageData.backups.server, label: 'Server', frontColor: '#79D2DE' },
      { value: usageData.backups.workstation, label: 'Workstation', frontColor: '#F5A623' },
    ];

    return (
      <View>
        <Text style={styles.chartTitle}>Cloud Backups</Text>
        <BarChart
          data={data}
          width={width - 64}
          height={200}
          barWidth={40}
          spacing={20}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: '#333' }}
          noOfSections={3}
          maxValue={Math.max(...data.map(item => item.value), 10)}
          labelWidth={40}
          backgroundColor="#fff"
        />
      </View>
    );
  };

  const renderCloudStorageUsageChart = () => {
    if (!usageData) return null;
    const data = [
      { value: usageData.cloudStorage.regular, label: 'Regular', color: '#177AD5' },
      { value: usageData.cloudStorage.object, label: 'Object', color: '#79D2DE' },
    ];

    return (
      <View>
        <Text style={styles.chartTitle}>Cloud Storage Usage</Text>
        <PieChart
          data={data}
          width={width - 64}
          height={200}
          innerRadius={60}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerLabelText}>{bytesToSize(usageData.cloudStorage.total)}</Text>
              <Text style={styles.centerLabelSubtext}>Total</Text>
            </View>
          )}
        />
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{`${item.label}: ${bytesToSize(item.value)}`}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderDataTransferInfo = () => {
    if (!usageData) return null;
    return (
      <View>
        <Text style={styles.infoText}>Agent Inbound: {bytesToSize(usageData.dataTransfer.agentIn)}</Text>
        <Text style={styles.infoText}>Agent Outbound: {bytesToSize(usageData.dataTransfer.agentOut)}</Text>
        <Text style={styles.infoText}>VBR Inbound: {bytesToSize(usageData.dataTransfer.vbrIn)}</Text>
        <Text style={styles.infoText}>VBR Outbound: {bytesToSize(usageData.dataTransfer.vbrOut)}</Text>
      </View>
    );
  };

  const renderCloudReplicasInfo = () => {
    if (!usageData) return null;
    return (
      <View>
        <Text style={styles.infoText}>Number of Replicas: {usageData.cloudReplicas.count}</Text>
        <Text style={styles.infoText}>Compute Time: {usageData.cloudReplicas.computeTime} seconds</Text>
        <Text style={styles.infoText}>Storage Used: {bytesToSize(usageData.cloudReplicas.storageUsage)}</Text>
        <Text style={styles.infoText}>Data Inbound: {bytesToSize(usageData.cloudReplicas.dataIn)}</Text>
        <Text style={styles.infoText}>Data Outbound: {bytesToSize(usageData.cloudReplicas.dataOut)}</Text>
      </View>
    );
  };

  const renderManagedResourcesInfo = () => {
    if (!usageData) return null;
    return (
      <View>
        <Text style={styles.infoText}>Server Agents: {usageData.managedResources.serverAgents}</Text>
        <Text style={styles.infoText}>Workstation Agents: {usageData.managedResources.workstationAgents}</Text>
        <Text style={styles.infoText}>Virtual Machines: {usageData.managedResources.vms}</Text>
        <Text style={styles.infoText}>Cloud VMs: {usageData.managedResources.cloudVms}</Text>
      </View>
    );
  };

  const renderFileSharesInfo = () => {
    if (!usageData) return null;
    return (
      <View>
        <Text style={styles.infoText}>Archive Size: {bytesToSize(usageData.fileShares.archiveSize)}</Text>
        <Text style={styles.infoText}>Backup Size: {bytesToSize(usageData.fileShares.backupSize)}</Text>
        <Text style={styles.infoText}>Source Size: {bytesToSize(usageData.fileShares.sourceSize)}</Text>
        <Text style={styles.infoText}>Protected Shares: {usageData.fileShares.protected}</Text>
      </View>
    );
  };

  const renderO365Info = () => {
    if (!usageData) return null;
    return (
      <View>
        <Text style={styles.infoText}>Archive Size: {bytesToSize(usageData.o365.archiveSize)}</Text>
        <Text style={styles.infoText}>Backup Size: {bytesToSize(usageData.o365.backupSize)}</Text>
        <Text style={styles.infoText}>Protected Groups: {usageData.o365.protectedGroups}</Text>
        <Text style={styles.infoText}>Protected Sites: {usageData.o365.protectedSites}</Text>
        <Text style={styles.infoText}>Protected Teams: {usageData.o365.protectedTeams}</Text>
        <Text style={styles.infoText}>Protected Users: {usageData.o365.protectedUsers}</Text>
      </View>
    );
  };

  const renderO365ProtectedItemsChart = () => {
    if (!usageData) return null;
    const data = [
      { value: usageData.o365.protectedGroups, label: 'Groups', frontColor: '#177AD5' },
      { value: usageData.o365.protectedSites, label: 'Sites', frontColor: '#79D2DE' },
      { value: usageData.o365.protectedTeams, label: 'Teams', frontColor: '#F5A623' },
      { value: usageData.o365.protectedUsers, label: 'Users', frontColor: '#FD6585' },
    ];

    return (
      <View>
        <Text style={styles.chartTitle}>O365 Protected Items</Text>
        <BarChart
          data={data}
          width={width - 64}
          height={200}
          barWidth={40}
          spacing={20}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: '#333' }}
          noOfSections={5}
          maxValue={Math.max(...data.map(item => item.value), 10)}
          labelWidth={40}
          backgroundColor="#fff"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Billing Dashboard</Text>
        {renderCard('Cloud Backups', renderBackupsChart(), 'backups')}
        {renderCard('Cloud Storage Usage', renderCloudStorageUsageChart(), 'cloudStorage')}
        {renderCard('Data Transfer', renderDataTransferInfo(), 'dataTransfer')}
        {renderCard('Cloud Replicas', renderCloudReplicasInfo(), 'cloudReplicas')}
        {renderCard('Managed Resources', renderManagedResourcesInfo(), 'managedResources')}
        {renderCard('File Shares', renderFileSharesInfo(), 'fileShares')}
        {renderCard('Office 365 Backup', renderO365Info(), 'o365')}
        {renderCard('O365 Protected Items', renderO365ProtectedItemsChart(), 'o365Chart')}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004D40',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#004D40',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  centerLabelSubtext: {
    fontSize: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
  },
});

export default BillingDashboardScreen;