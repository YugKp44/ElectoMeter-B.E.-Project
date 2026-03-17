import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const LIVE_WINDOW_MS = 15000;

function formatSignalAge(lastLineAt) {
  if (!lastLineAt) {
    return 'No signal yet';
  }

  const parsed = new Date(lastLineAt);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown';
  }

  const ageSeconds = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 1000));

  if (ageSeconds < 2) {
    return 'Just now';
  }

  return `${ageSeconds}s ago`;
}

const EspStreamStatusCard = ({ status, loading, error }) => {
  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color="#1E88E5" />
        <Text style={styles.loadingText}>Checking ESP stream...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>ESP stream status unavailable</Text>
      </View>
    );
  }

  if (!status) {
    return null;
  }

  const hasSignal = Boolean(status.lastLineAt);
  const ageMs = hasSignal ? Date.now() - new Date(status.lastLineAt).getTime() : Number.POSITIVE_INFINITY;
  const isLive = Boolean(status.serialConnected && hasSignal && ageMs <= LIVE_WINDOW_MS);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>ESP Stream Monitor</Text>
        <View style={[styles.statusBadge, isLive ? styles.liveBadge : styles.waitingBadge]}>
          <Text style={styles.statusBadgeText}>{isLive ? 'LIVE' : 'WAITING'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Source</Text>
        <Text style={styles.value}>ESP Serial</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Serial Port</Text>
        <Text style={styles.value}>{status.portPath || 'Not set'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Baud Rate</Text>
        <Text style={styles.value}>{status.baudRate || '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Packets Ingested</Text>
        <Text style={styles.value}>{status.totalIngested ?? 0}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Last Packet</Text>
        <Text style={styles.value}>{formatSignalAge(status.lastLineAt)}</Text>
      </View>

      {status.lastError ? <Text style={styles.inlineError}>Last error: {status.lastError}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveBadge: {
    backgroundColor: '#E6F6EC',
  },
  waitingBadge: {
    backgroundColor: '#FFF4E5',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  inlineError: {
    marginTop: 8,
    fontSize: 12,
    color: '#D32F2F',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
  },
});

export default EspStreamStatusCard;
