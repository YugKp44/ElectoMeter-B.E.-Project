import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const UsageHistoryChart = ({ data, loading, error, period }) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load chart data</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No data available</Text>
      </View>
    );
  }

  // Sample data for better visualization (take every nth reading based on period)
  const sampleRate = period === '7d' ? 50 : period === '24h' ? 20 : 10;
  const sampledData = data.filter((_, index) => index % sampleRate === 0);

  const chartData = {
    labels: sampledData.map((reading, index) => {
      if (index % Math.ceil(sampledData.length / 6) === 0) {
        const date = new Date(reading.timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      return '';
    }),
    datasets: [
      {
        data: sampledData.map((reading) => reading.power_watts),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Power Usage History</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '3',
            strokeWidth: '2',
            stroke: '#4CAF50',
          },
        }}
        bezier
        style={styles.chart}
      />
      <Text style={styles.unit}>Power (Watts)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  unit: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
  },
});

export default UsageHistoryChart;
