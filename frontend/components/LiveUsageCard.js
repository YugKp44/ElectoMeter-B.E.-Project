import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const STALE_AFTER_MS = 120000;

function formatValue(value, digits, unit = '') {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return '--';
  }

  const formatted = Number(value).toFixed(digits);
  return unit ? `${formatted} ${unit}` : formatted;
}

const LiveUsageCard = ({ data, loading, error, dataSource = 'real' }) => {
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

  const displayData = data;

  const apparentPower = Number.isFinite(Number(displayData.apparent_power_va))
    ? Number(displayData.apparent_power_va)
    : Number(displayData.voltage) * Number(displayData.current);

  const reactivePower = Number.isFinite(Number(displayData.reactive_power_var))
    ? Number(displayData.reactive_power_var)
    : Math.sqrt(Math.max((apparentPower ** 2) - (Number(displayData.power_watts || 0) ** 2), 0));

  const powerFactor = Number.isFinite(Number(displayData.power_factor))
    ? Number(displayData.power_factor)
    : (apparentPower > 0 ? Number(displayData.power_watts || 0) / apparentPower : 0);

  const frequencyHz = Number.isFinite(Number(displayData.frequency_hz))
    ? Number(displayData.frequency_hz)
    : null;

  const energyWh = Number.isFinite(Number(displayData.energy_wh))
    ? Number(displayData.energy_wh)
    : null;

  const metricItems = [
    { label: 'Voltage', value: formatValue(displayData.voltage, 1, 'V') },
    { label: 'Current', value: formatValue(displayData.current, 3, 'A') },
    { label: 'Apparent Power', value: formatValue(apparentPower, 1, 'VA') },
    { label: 'Reactive Power', value: formatValue(reactivePower, 1, 'var') },
    { label: 'Power Factor', value: formatValue(powerFactor, 3) },
    { label: 'Frequency', value: formatValue(frequencyHz, 2, 'Hz') },
    { label: 'Energy', value: energyWh === null ? '--' : formatValue(energyWh / 1000, 3, 'kWh') },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Live PZEM Telemetry</Text>
        <View
          style={[
            styles.sourceBadge,
            dataSource === 'mock' ? styles.sourceBadgeMock : styles.sourceBadgeReal,
          ]}
        >
          <Text style={styles.sourceBadgeText}>{dataSource === 'mock' ? 'SIMULATED' : 'REAL'}</Text>
        </View>
      </View>
      {dataSource === 'mock' ? (
        <Text style={styles.sourceHint}>Using simulation because real live data is unavailable.</Text>
      ) : null}
      <View style={styles.powerContainer}>
        <Text style={styles.powerValue}>{formatValue(displayData.power_watts, 1)}</Text>
        <Text style={styles.powerUnit}>Watts</Text>
      </View>
      <View style={styles.metricsGrid}>
        {metricItems.map((item) => (
          <View key={item.label} style={styles.metricItem}>
            <Text style={styles.detailLabel}>{item.label}</Text>
            <Text style={styles.detailValue}>{item.value}</Text>
          </View>
        ))}
      </View>
      {isStale ? (
        <Text style={styles.staleText}>No fresh hardware update in the last 2 minutes. Showing last real reading.</Text>
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
  },
  titleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sourceBadgeReal: {
    backgroundColor: '#DCFCE7',
  },
  sourceBadgeMock: {
    backgroundColor: '#FEF3C7',
  },
  sourceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  sourceHint: {
    width: '100%',
    fontSize: 12,
    color: '#92400E',
    marginBottom: 8,
  },
  powerContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
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
  metricsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  staleText: {
    fontSize: 12,
    color: '#D97706',
    marginTop: 2,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
  },
});

export default LiveUsageCard;
