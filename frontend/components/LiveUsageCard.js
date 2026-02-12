import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const LiveUsageCard = ({ data, loading, error }) => {
  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>Failed to load live data</Text>
      </View>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Current Power Usage</Text>
      <View style={styles.powerContainer}>
        <Text style={styles.powerValue}>{data.power_watts?.toFixed(1)}</Text>
        <Text style={styles.powerUnit}>Watts</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Voltage</Text>
          <Text style={styles.detailValue}>{data.voltage?.toFixed(1)} V</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Current</Text>
          <Text style={styles.detailValue}>{data.current?.toFixed(2)} A</Text>
        </View>
      </View>
      <Text style={styles.timestamp}>
        Last updated: {new Date(data.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  powerContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  powerValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  powerUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
  },
});

export default LiveUsageCard;
