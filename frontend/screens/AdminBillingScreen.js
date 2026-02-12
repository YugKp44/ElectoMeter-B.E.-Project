import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { getAllBills, updateBillStatus } from '../services/api';

const AdminBillingScreen = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(null); // null, 'DUE', 'PAID'

  const fetchBills = async () => {
    try {
      const data = await getAllBills(filter);
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBills();
  };

  const handleUpdateStatus = async (billId, currentStatus) => {
    const newStatus = currentStatus === 'DUE' ? 'PAID' : 'DUE';
    
    Alert.alert(
      'Update Bill Status',
      `Mark this bill as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await updateBillStatus(billId, newStatus);
              // Update local state
              setBills((prevBills) =>
                prevBills.map((bill) =>
                  bill._id === billId ? { ...bill, status: newStatus } : bill
                )
              );
              Alert.alert('Success', `Bill marked as ${newStatus}`);
            } catch (error) {
              Alert.alert('Error', 'Failed to update bill status');
              console.error('Error updating bill:', error);
            }
          },
        },
      ]
    );
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderBillCard = ({ item }) => {
    const isDue = item.status === 'DUE';
    const statusColor = isDue ? '#F44336' : '#4CAF50';

    return (
      <View style={styles.billCard}>
        <View style={styles.billHeader}>
          <View>
            <Text style={styles.meterId}>{item.meterId}</Text>
            <Text style={styles.period}>
              {getMonthName(item.month)} {item.year}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.billDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Energy Consumed</Text>
            <Text style={styles.detailValue}>{item.total_kwh.toFixed(2)} kWh</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={[styles.detailValue, styles.amount]}>
              ₹{item.amount_due.toFixed(2)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{formatDueDate(item.dueDate)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: statusColor }]}
          onPress={() => handleUpdateStatus(item._id, item.status)}
        >
          <Text style={styles.actionButtonText}>
            Mark as {isDue ? 'PAID' : 'DUE'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Bills...</Text>
      </View>
    );
  }

  // Calculate totals
  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount_due, 0);
  const dueAmount = bills
    .filter((bill) => bill.status === 'DUE')
    .reduce((sum, bill) => sum + bill.amount_due, 0);
  const paidAmount = bills
    .filter((bill) => bill.status === 'PAID')
    .reduce((sum, bill) => sum + bill.amount_due, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Billing Management</Text>
        <Text style={styles.headerSubtitle}>
          {bills.length} {bills.length === 1 ? 'Bill' : 'Bills'}
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#2196F3' }]}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#F44336' }]}>
          <Text style={styles.summaryLabel}>Due</Text>
          <Text style={styles.summaryValue}>₹{dueAmount.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.summaryLabel}>Paid</Text>
          <Text style={styles.summaryValue}>₹{paidAmount.toFixed(2)}</Text>
        </View>
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
          style={[styles.filterButton, filter === 'DUE' && styles.filterButtonActive]}
          onPress={() => setFilter('DUE')}
        >
          <Text style={[styles.filterText, filter === 'DUE' && styles.filterTextActive]}>
            Due
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'PAID' && styles.filterButtonActive]}
          onPress={() => setFilter('PAID')}
        >
          <Text style={[styles.filterText, filter === 'PAID' && styles.filterTextActive]}>
            Paid
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={bills}
        renderItem={renderBillCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bills found</Text>
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  billCard: {
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
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  meterId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  period: {
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
  billDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  amount: {
    fontSize: 16,
    color: '#4CAF50',
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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

export default AdminBillingScreen;
