import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { getAllAlerts } from '../services/api';

const AdminAlertsScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(null); // null, 'THEFT_SUSPICION', 'HIGH_USAGE'

  const fetchAlerts = async () => {
    try {
      const data = await getAllAlerts(filter);
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'THEFT_SUSPICION':
        return '#F44336';
      case 'HIGH_USAGE':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'THEFT_SUSPICION':
        return '🚨';
      case 'HIGH_USAGE':
        return '📊';
      default:
        return '⚠️';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderAlertCard = ({ item }) => {
    const color = getAlertColor(item.type);
    const icon = getAlertIcon(item.type);

    return (
      <View style={[styles.alertCard, { borderLeftColor: color }]}>
        <View style={styles.alertHeader}>
          <Text style={styles.alertIcon}>{icon}</Text>
          <View style={styles.alertInfo}>
            <Text style={styles.meterId}>{item.meterId}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: color }]}>
            <Text style={styles.typeText}>
              {item.type.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <Text style={styles.message}>{item.message}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Alerts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Alerts</Text>
        <Text style={styles.headerSubtitle}>
          {alerts.length} {alerts.length === 1 ? 'Alert' : 'Alerts'}
        </Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === null && styles.filterButtonActive]}
          onPress={() => setFilter(null)}
        >
          <Text style={[styles.filterText, filter === null && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'THEFT_SUSPICION' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('THEFT_SUSPICION')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'THEFT_SUSPICION' && styles.filterTextActive,
            ]}
          >
            🚨 Theft
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'HIGH_USAGE' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('HIGH_USAGE')}
        >
          <Text
            style={[styles.filterText, filter === 'HIGH_USAGE' && styles.filterTextActive]}
          >
            📊 High Usage
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={alerts}
        renderItem={renderAlertCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>No alerts found</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  meterId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default AdminAlertsScreen;
