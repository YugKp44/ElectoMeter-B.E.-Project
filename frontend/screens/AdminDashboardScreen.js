import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { getSystemStats, getAreaWiseAnalytics, getConsumptionPrediction } from '../services/api';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = () => {
  const [stats, setStats] = useState(null);
  const [areaData, setAreaData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const fetchAllData = async () => {
    try {
      // Use mock data with realistic values for 50 meters across 5 zones
      const mockStats = {
        meters: { total: 50, active: 46, inactive: 4 },
        bills: { total: 200, due: 18, paid: 182 },
        alerts: { total: 127, recent24h: 8, theftSuspicion: 94, highUsage: 33 },
        revenue: { total: 895640, pending: 87320, collected: 808320 },
        energy: { totalKwh: 111955 }
      };

      const mockAreaData = [
        {
          area: 'Zone A',
          meterCount: 10,
          consumption30Days: 3842.5,
          currentPower: 384.2,
          revenue30Days: 30740,
          prediction: { nextMonth: 3956.2, trend: 'increasing', dailyAverage: 128.1 }
        },
        {
          area: 'Zone B',
          meterCount: 10,
          consumption30Days: 27894.0,
          currentPower: 2789.4,
          revenue30Days: 223152,
          prediction: { nextMonth: 28450.8, trend: 'increasing', dailyAverage: 929.8 }
        },
        {
          area: 'Zone C',
          meterCount: 10,
          consumption30Days: 51570.0,
          currentPower: 5157.0,
          revenue30Days: 412560,
          prediction: { nextMonth: 52814.7, trend: 'increasing', dailyAverage: 1719.0 }
        },
        {
          area: 'Zone D',
          meterCount: 10,
          consumption30Days: 6908.0,
          currentPower: 690.8,
          revenue30Days: 55264,
          prediction: { nextMonth: 7046.2, trend: 'stable', dailyAverage: 230.3 }
        },
        {
          area: 'Zone E',
          meterCount: 10,
          consumption30Days: 28740.5,
          currentPower: 2874.1,
          revenue30Days: 229924,
          prediction: { nextMonth: 29437.1, trend: 'increasing', dailyAverage: 958.0 }
        }
      ];

      const mockPrediction = {
        prediction: [
          { date: new Date().toISOString(), predictedPower: 2389.0, confidence: 92 },
          { date: new Date(Date.now() + 86400000).toISOString(), predictedPower: 2412.3, confidence: 89 },
          { date: new Date(Date.now() + 172800000).toISOString(), predictedPower: 2398.7, confidence: 87 },
          { date: new Date(Date.now() + 259200000).toISOString(), predictedPower: 2456.2, confidence: 85 },
          { date: new Date(Date.now() + 345600000).toISOString(), predictedPower: 2489.5, confidence: 83 },
          { date: new Date(Date.now() + 432000000).toISOString(), predictedPower: 2501.8, confidence: 81 },
          { date: new Date(Date.now() + 518400000).toISOString(), predictedPower: 2534.6, confidence: 79 }
        ],
        trend: 'increasing',
        confidence: 85.7,
        summary: {
          avgHistorical: 2376.8,
          avgPredicted: 2454.6,
          changePercent: 3.27
        }
      };

      setStats(mockStats);
      setAreaData(mockAreaData);
      setPrediction(mockPrediction);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Admin Portal</Text>
            <Text style={styles.headerSubtitle}>System Control Center</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>●  LIVE</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
            📊 Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'areas' && styles.tabActive]}
          onPress={() => setSelectedTab('areas')}
        >
          <Text style={[styles.tabText, selectedTab === 'areas' && styles.tabTextActive]}>
            🗺️ Areas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'prediction' && styles.tabActive]}
          onPress={() => setSelectedTab('prediction')}
        >
          <Text style={[styles.tabText, selectedTab === 'prediction' && styles.tabTextActive]}>
            🔮 Forecast
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
      >
        {selectedTab === 'overview' && stats && (
          <OverviewTab stats={stats} />
        )}
        {selectedTab === 'areas' && areaData && (
          <AreasTab areaData={areaData} />
        )}
        {selectedTab === 'prediction' && prediction && (
          <PredictionTab prediction={prediction} />
        )}
      </ScrollView>
    </View>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats }) => (
  <View style={styles.tabContent}>
    <View style={styles.quickStats}>
      <QuickStatCard
        title="Total Power"
        value={`${(stats.energy?.totalKwh || 0).toFixed(1)} kWh`}
        subtitle="Last 30 Days"
        color="#4CAF50"
        icon="⚡"
      />
      <QuickStatCard
        title="Revenue"
        value={`₹${(stats.revenue?.total || 0).toFixed(0)}`}
        subtitle="Collected"
        color="#2196F3"
        icon="💰"
      />
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>System Health</Text>
      <View style={styles.metricsRow}>
        <MetricCard title="Active Meters" value={stats.meters?.active || 0} total={stats.meters?.total || 0} color="#4CAF50" />
        <MetricCard title="Paid Bills" value={stats.bills?.paid || 0} total={stats.bills?.total || 0} color="#2196F3" />
      </View>
      <View style={styles.metricsRow}>
        <MetricCard title="Pending Bills" value={stats.bills?.due || 0} total={stats.bills?.total || 0} color="#FF9800" />
        <MetricCard title="Recent Alerts" value={stats.alerts?.recent24h || 0} total={stats.alerts?.total || 0} color="#F44336" />
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Alert Breakdown</Text>
      <View style={styles.alertsGrid}>
        <AlertCard type="Theft" count={stats.alerts?.theftSuspicion || 0} icon="🚨" color="#D32F2F" />
        <AlertCard type="High Usage" count={stats.alerts?.highUsage || 0} icon="📊" color="#FF9800" />
      </View>
    </View>
  </View>
);

// Areas Tab Component
const AreasTab = ({ areaData }) => {
  const totalPower = areaData.reduce((sum, area) => sum + area.consumption30Days, 0);

  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Total Power by Area (30 Days)</Text>
        <View style={styles.chartCard}>
          {areaData.length > 0 ? (
            <BarChart
              data={{
                labels: areaData.map(a => a.area.replace('Zone ', '')),
                datasets: [{ data: areaData.map(a => parseFloat(a.consumption30Days.toFixed(0))) }]
              }}
              width={width - 48}
              height={220}
              yAxisSuffix=" kWh"
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                barPercentage: 0.7,
              }}
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noDataText}>No data available</Text>
          )}
        </View>
      </View>

      {areaData.map((area, index) => (
        <View key={index} style={styles.areaCard}>
          <View style={styles.areaHeader}>
            <View>
              <Text style={styles.areaName}>{area.area}</Text>
              <Text style={styles.areaMeterCount}>{area.meterCount} Meters</Text>
            </View>
            <View style={styles.areaProgress}>
              <Text style={styles.areaPercentage}>
                {totalPower > 0 ? ((area.consumption30Days / totalPower) * 100).toFixed(1) : 0}%
              </Text>
            </View>
          </View>

          <View style={styles.areaStats}>
            <View style={styles.areaStat}>
              <Text style={styles.areaStatLabel}>Consumption</Text>
              <Text style={styles.areaStatValue}>{area.consumption30Days.toFixed(2)} kWh</Text>
            </View>
            <View style={styles.areaStat}>
              <Text style={styles.areaStatLabel}>Current Power</Text>
              <Text style={styles.areaStatValue}>{area.currentPower.toFixed(1)} W</Text>
            </View>
            <View style={styles.areaStat}>
              <Text style={styles.areaStatLabel}>Revenue</Text>
              <Text style={styles.areaStatValue}>₹{area.revenue30Days.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.predictionBox}>
            <Text style={styles.predictionLabel}>📈 Next Month Forecast</Text>
            <Text style={styles.predictionValue}>{area.prediction?.nextMonth.toFixed(1)} kWh</Text>
            <Text style={styles.predictionTrend}>
              Trend: {area.prediction?.trend || 'stable'} ({area.prediction?.dailyAverage.toFixed(1)} kWh/day)
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// Prediction Tab Component
const PredictionTab = ({ prediction }) => {
  if (!prediction || !prediction.prediction || prediction.prediction.length === 0) {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.noDataText}>Insufficient data for prediction</Text>
      </View>
    );
  }

  const chartData = {
    labels: prediction.prediction.map((p, i) => i === 0 ? 'Today' : `+${i}d`).filter((_, i) => i % 2 === 0),
    datasets: [
      {
        data: prediction.prediction.map(p => parseFloat(p.predictedPower.toFixed(0))).filter((_, i) => i % 2 === 0),
        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
        strokeWidth: 3
      }
    ]
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'increasing': return '#F44336';
      case 'decreasing': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7-Day Power Consumption Forecast</Text>
        <View style={styles.chartCard}>
          <LineChart
            data={chartData}
            width={width - 48}
            height={220}
            yAxisSuffix=" W"
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#FF6B6B'
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={[styles.trendCard, { borderLeftColor: getTrendColor(prediction.trend) }]}>
        <Text style={styles.trendIcon}>{getTrendIcon(prediction.trend)}</Text>
        <View style={styles.trendContent}>
          <Text style={styles.trendTitle}>Consumption Trend</Text>
          <Text style={[styles.trendValue, { color: getTrendColor(prediction.trend) }]}>
            {prediction.trend.toUpperCase()}
          </Text>
          <Text style={styles.trendSubtitle}>
            {prediction.summary?.changePercent > 0 ? '+' : ''}
            {prediction.summary?.changePercent.toFixed(1)}% change expected
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Forecast Details</Text>
        <View style={styles.forecastStats}>
          <ForecastStatCard
            label="Average Historical"
            value={`${prediction.summary?.avgHistorical.toFixed(1)} W`}
            icon="📊"
          />
          <ForecastStatCard
            label="Average Predicted"
            value={`${prediction.summary?.avgPredicted.toFixed(1)} W`}
            icon="🔮"
          />
          <ForecastStatCard
            label="Confidence Level"
            value={`${prediction.confidence.toFixed(1)}%`}
            icon="✓"
          />
        </View>
      </View>

      <View style={styles.predictionList}>
        <Text style={styles.sectionTitle}>Daily Predictions</Text>
        {prediction.prediction.slice(0, 7).map((pred, index) => (
          <View key={index} style={styles.predictionItem}>
            <View style={styles.predictionDay}>
              <Text style={styles.predictionDayText}>
                {index === 0 ? 'Tomorrow' : `Day ${index + 1}`}
              </Text>
              <Text style={styles.predictionDate}>{new Date(pred.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.predictionData}>
              <Text style={styles.predictionPower}>{pred.predictedPower.toFixed(1)} W</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{pred.confidence.toFixed(0)}%</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Reusable Components
const QuickStatCard = ({ title, value, subtitle, color, icon }) => (
  <View style={[styles.quickStatCard, { borderTopColor: color }]}>
    <Text style={styles.quickStatIcon}>{icon}</Text>
    <Text style={styles.quickStatValue}>{value}</Text>
    <Text style={styles.quickStatTitle}>{title}</Text>
    <Text style={styles.quickStatSubtitle}>{subtitle}</Text>
  </View>
);

const MetricCard = ({ title, value, total, color }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricTitle}>{title}</Text>
    <View style={styles.metricContent}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricTotal}>/ {total}</Text>
    </View>
    <View style={styles.metricBar}>
      <View style={[styles.metricProgress, { width: `${(value/total)*100}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const AlertCard = ({ type, count, icon, color }) => (
  <View style={[styles.alertCard, { borderLeftColor: color }]}>
    <Text style={styles.alertIcon}>{icon}</Text>
    <Text style={styles.alertCount}>{count}</Text>
    <Text style={styles.alertType}>{type}</Text>
  </View>
);

const ForecastStatCard = ({ label, value, icon }) => (
  <View style={styles.forecastStatCard}>
    <Text style={styles.forecastStatIcon}>{icon}</Text>
    <Text style={styles.forecastStatValue}>{value}</Text>
    <Text style={styles.forecastStatLabel}>{label}</Text>
  </View>
);

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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStatIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quickStatTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  quickStatSubtitle: {
    fontSize: 11,
    color: '#999',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metricTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  metricContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricTotal: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
  },
  metricBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  metricProgress: {
    height: '100%',
    borderRadius: 2,
  },
  alertsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  alertCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  alertCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alertType: {
    fontSize: 12,
    color: '#666',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
  areaCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  areaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  areaName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  areaMeterCount: {
    fontSize: 13,
    color: '#666',
  },
  areaProgress: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  areaPercentage: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  areaStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  areaStat: {
    alignItems: 'center',
  },
  areaStatLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  areaStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  predictionBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  predictionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  predictionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 4,
  },
  predictionTrend: {
    fontSize: 12,
    color: '#666',
  },
  trendCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  trendContent: {
    flex: 1,
  },
  trendTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  trendValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  forecastStats: {
    flexDirection: 'row',
    gap: 12,
  },
  forecastStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  forecastStatIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  forecastStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  forecastStatLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  predictionList: {
    marginTop: 8,
  },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  predictionDay: {
    flex: 1,
  },
  predictionDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  predictionDate: {
    fontSize: 12,
    color: '#999',
  },
  predictionData: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  predictionPower: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  confidenceBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;
