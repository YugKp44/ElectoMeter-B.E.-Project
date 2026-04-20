import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const levelColors = {
  HIGH: '#DC2626',
  MEDIUM: '#F59E0B',
  LOW: '#16A34A',
};

function asCurrency(value) {
  if (!Number.isFinite(Number(value))) {
    return '--';
  }
  return `₹${Number(value).toFixed(2)}`;
}

function asKwh(value) {
  if (!Number.isFinite(Number(value))) {
    return '--';
  }
  return `${Number(value).toFixed(2)} kWh`;
}

function asKg(value) {
  if (!Number.isFinite(Number(value))) {
    return '--';
  }
  return `${Number(value).toFixed(3)} kg`;
}

const InsightsSummaryCard = ({ insights, loading, error }) => {
  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Smart Insights</Text>
        <Text style={styles.subtle}>Loading insights...</Text>
      </View>
    );
  }

  if (error || !insights) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Smart Insights</Text>
        <Text style={styles.errorText}>Unable to load insights</Text>
      </View>
    );
  }

  const anomaly = insights.anomaly || {};
  const forecast = insights.forecast || {};
  const sustainability = insights.sustainability || {};
  const level = String(anomaly.level || 'LOW').toUpperCase();
  const badgeColor = levelColors[level] || levelColors.LOW;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Smart Insights</Text>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{`Risk ${anomaly.score || 0}`}</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Today Cost</Text>
          <Text style={styles.metricValue}>{asCurrency(forecast.todayCost)}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Month Forecast</Text>
          <Text style={styles.metricValue}>{asCurrency(forecast.monthlyForecastBill)}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Today Energy</Text>
          <Text style={styles.metricValue}>{asKwh(forecast.todayEnergyKwh)}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Today Carbon</Text>
          <Text style={styles.metricValue}>{asKg(sustainability.todayCarbonKg)}</Text>
        </View>
      </View>

      <View style={styles.recommendBox}>
        <Text style={styles.recommendTitle}>Recommended Action</Text>
        <Text style={styles.recommendText}>{insights.recommendations?.[0] || 'No recommendation'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtle: {
    color: '#6B7280',
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricBox: {
    width: '48.5%',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  recommendBox: {
    marginTop: 10,
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  recommendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 3,
  },
  recommendText: {
    fontSize: 12,
    color: '#065F46',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
});

export default InsightsSummaryCard;
