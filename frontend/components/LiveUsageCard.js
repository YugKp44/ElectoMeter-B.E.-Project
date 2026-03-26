import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const STALE_AFTER_MS = 10000;

const LiveUsageCard = ({ data, loading, error }) => {
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  const timestampMs = new Date(data.timestamp).getTime();
  const hasValidTimestamp = Number.isFinite(timestampMs);
  const isStale = hasValidTimestamp ? nowMs - timestampMs > STALE_AFTER_MS : false;

  const displayData = isStale
    ? {
        ...data,
        power_watts: 0,
        current: 0,
      }
    : data;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Current Power Usage</Text>
      <View style={styles.powerContainer}>
        <Text style={styles.powerValue}>{displayData.power_watts?.toFixed(1)}</Text>
        <Text style={styles.powerUnit}>Watts</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Voltage</Text>
          <Text style={styles.detailValue}>{displayData.voltage?.toFixed(1)} V</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Current</Text>
          <Text style={styles.detailValue}>{displayData.current?.toFixed(2)} A</Text>
        </View>
      </View>
      {isStale ? (
        <Text style={styles.staleText}>No fresh PZEM data for 10s, showing zero load</Text>
      ) : null}
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
  staleText: {
    fontSize: 12,
    color: '#D97706',
    marginTop: 4,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
  },
});

export default LiveUsageCard;
