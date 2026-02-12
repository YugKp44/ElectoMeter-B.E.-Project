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
import { getAllMeters } from '../services/api';

const AdminMetersScreen = () => {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMeters = async () => {
    try {
      // Mock data for 50 meters with realistic values
      const mockMeters = [];
      const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];
      const owners = {
        'Zone A': ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Deshmukh', 'Vikram Singh', 'Meera Iyer', 'Arjun Kapoor', 'Kavita Reddy', 'Sanjay Gupta', 'Pooja Malhotra'],
        'Zone B': ['Tech Solutions Pvt Ltd', 'Infosys Technologies', 'ICICI Bank Corporate', 'Reliance Industries Office', 'Green Cafe & Restaurant', 'Style Fashion Store', 'FitZone Gym', 'Mumbai Hotel & Suites', 'StarBucks Coffee', 'PVR Cinemas'],
        'Zone C': ['ABC Manufacturing Ltd', 'Precision Tools Co.', 'Metro Textiles', 'Steel Industries Ltd', 'Pharma Labs India', 'Auto Parts Manufacturing', 'Chemical Solutions Pvt Ltd', 'Packaging Industries', 'Electronics Assembly Unit', 'Food Processing Plant'],
        'Zone D': ['Sunita Desai', 'Rahul Nair', 'Smart Mart Supermarket', 'Dr. Mehta Clinic', 'Neha Chopra', 'Karan Johar Residence', 'Bandra Cafe Lounge', 'The Bookstore', 'Yoga Studio Wellness', 'Dental Care Clinic'],
        'Zone E': ['Skyline Towers - Wing A', 'Skyline Towers - Wing B', 'Ocean View Apartments', 'Metro Heights Complex', 'Royal Residency - Tower 1', 'Royal Residency - Tower 2', 'Green Park Society', 'Sunrise Apartments', 'Elite Towers', 'Paradise Residency']
      };
      
      const basePower = { 'Zone A': 350, 'Zone B': 2500, 'Zone C': 5200, 'Zone D': 650, 'Zone E': 2900 };
      
      for (let i = 1; i <= 50; i++) {
        const zoneIndex = Math.floor((i - 1) / 10);
        const zone = zones[zoneIndex];
        const ownerIndex = (i - 1) % 10;
        const isInactive = (i === 9 || i === 34); // 2 inactive meters
        
        mockMeters.push({
          meterId: `MTR-${String(1000 + i).slice(1)}`,
          ownerName: owners[zone][ownerIndex],
          address: `Address for ${owners[zone][ownerIndex]}, Mumbai`,
          area: zone,
          latestReading: isInactive ? null : {
            timestamp: new Date(Date.now() - Math.random() * 240000), // Within last 4 minutes
            power_watts: basePower[zone] + (Math.random() * 200 - 100),
            voltage: 230 + (Math.random() * 10 - 5),
            current: 1.5 + (Math.random() * 0.5)
          }
        });
      }
      
      setMeters(mockMeters);
    } catch (error) {
      console.error('Error fetching meters:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMeters();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMeters();
  };

  const getStatusColor = (reading) => {
    if (!reading) return '#999';
    const timeDiff = Date.now() - new Date(reading.timestamp).getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    if (minutesDiff < 5) return '#4CAF50'; // Active (green)
    if (minutesDiff < 60) return '#FF9800'; // Warning (orange)
    return '#F44336'; // Inactive (red)
  };

  const getStatusText = (reading) => {
    if (!reading) return 'No Data';
    const timeDiff = Date.now() - new Date(reading.timestamp).getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    if (minutesDiff < 5) return 'Active';
    if (minutesDiff < 60) return 'Warning';
    return 'Inactive';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderMeterCard = ({ item }) => {
    const reading = item.latestReading;
    const statusColor = getStatusColor(reading);
    const statusText = getStatusText(reading);

    return (
      <View style={styles.meterCard}>
        <View style={styles.meterHeader}>
          <View>
            <Text style={styles.meterId}>{item.meterId}</Text>
            <Text style={styles.ownerName}>{item.ownerName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        <Text style={styles.address}>📍 {item.address}</Text>

        {reading ? (
          <View style={styles.readingContainer}>
            <View style={styles.readingRow}>
              <View style={styles.readingItem}>
                <Text style={styles.readingLabel}>Power</Text>
                <Text style={styles.readingValue}>
                  {reading.power_watts.toFixed(1)} W
                </Text>
              </View>
              <View style={styles.readingItem}>
                <Text style={styles.readingLabel}>Voltage</Text>
                <Text style={styles.readingValue}>
                  {reading.voltage.toFixed(1)} V
                </Text>
              </View>
              <View style={styles.readingItem}>
                <Text style={styles.readingLabel}>Current</Text>
                <Text style={styles.readingValue}>
                  {reading.current.toFixed(2)} A
                </Text>
              </View>
            </View>
            <Text style={styles.timestamp}>
              Last Update: {formatTimestamp(reading.timestamp)}
            </Text>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No readings available</Text>
          </View>
        )}

        <Text style={styles.createdAt}>
          Installed: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Meters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Meters</Text>
        <Text style={styles.headerSubtitle}>
          {meters.length} {meters.length === 1 ? 'Meter' : 'Meters'} Registered
        </Text>
      </View>

      <FlatList
        data={meters}
        renderItem={renderMeterCard}
        keyExtractor={(item) => item.meterId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No meters found</Text>
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
  listContainer: {
    padding: 16,
  },
  meterCard: {
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
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  meterId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  readingContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  readingItem: {
    alignItems: 'center',
  },
  readingLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  readingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  noDataContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  noDataText: {
    color: '#999',
    fontSize: 14,
  },
  createdAt: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default AdminMetersScreen;
