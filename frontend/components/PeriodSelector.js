import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PeriodSelector = ({ selectedPeriod, onSelectPeriod }) => {
  const periods = [
    { value: '6h', label: '6H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
  ];

  return (
    <View style={styles.container}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.value}
          style={[
            styles.button,
            selectedPeriod === period.value && styles.buttonActive,
          ]}
          onPress={() => onSelectPeriod(period.value)}
        >
          <Text
            style={[
              styles.buttonText,
              selectedPeriod === period.value && styles.buttonTextActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  buttonTextActive: {
    color: '#fff',
  },
});

export default PeriodSelector;
