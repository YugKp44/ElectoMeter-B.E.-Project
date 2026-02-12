import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getAlerts } from '../services/api';

const METER_ID = 'MTR-1001';

const AlertsScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts(METER_ID);
      setAlerts(data);
      setError(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  const getAlertIcon = (type) => {
    return type === 'THEFT_SUSPICION' ? '⚠️' : '📊';
  };

  const getAlertColor = (type) => {
    return type === 'THEFT_SUSPICION' ? '#f44336' : '#FF9800';
  };

  const renderAlertItem = ({ item }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getAlertColor(item.type) + '20' },
          ]}
        >
          <Text style={styles.alertIcon}>{getAlertIcon(item.type)}</Text>
        </View>
        <View style={styles.alertContent}>
          <Text style={styles.alertType}>
            {item.type.replace('_', ' ')}
          </Text>
          <Text style={styles.alertMessage}>{item.message}</Text>
          <Text style={styles.alertTime}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load alerts</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts & Notifications</Text>
        <Text style={styles.headerSubtitle}>Meter ID: {METER_ID}</Text>
      </View>

      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyText}>No alerts at this time</Text>
            <Text style={styles.emptySubtext}>All systems are running normally</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingTop: 24,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  listContainer: {
    padding: 16,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertIcon: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  alertTime: {
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    color: '#4CAF50',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default AlertsScreen;
