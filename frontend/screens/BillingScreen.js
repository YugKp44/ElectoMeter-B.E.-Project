import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { writeAsStringAsync, documentDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getBills } from '../services/api';

const METER_ID = 'MTR-1001';

const BillingScreen = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await getBills(METER_ID);
      setBills(data);
      setError(false);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBills();
    setRefreshing(false);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[month - 1];
  };

  const handleBillPress = (bill) => {
    setSelectedBill(bill);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedBill(null);
  };

  const downloadBill = async (bill) => {
    try {
      const breakdown = calculateBillBreakdown(bill);
      const billContent = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        MAHARASHTRA STATE ELECTRICITY
           DISTRIBUTION CO. LTD.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

             OFFICIAL ELECTRICITY BILL
        🔒 GOVERNMENT AUTHORIZED DOCUMENT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONSUMER DETAILS
Meter ID: ${bill.meterId}
Billing Period: ${getMonthName(bill.month)} ${bill.year}
Bill Date: ${new Date().toLocaleDateString()}
Due Date: ${new Date(bill.dueDate).toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONSUMPTION DETAILS
Total Energy Consumed: ${bill.total_kwh.toFixed(2)} kWh
Average Daily Usage: ${(bill.total_kwh / 30).toFixed(2)} kWh/day
Tariff Rate: ₹6.50 per kWh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHARGES BREAKDOWN
Energy Charges: ₹${breakdown.energyCharge}
Fixed Charges: ₹${breakdown.fixedCharge}
────────────────────────────────────────
Subtotal: ₹${breakdown.subtotal}
GST (18%): ₹${breakdown.tax}
────────────────────────────────────────
TOTAL AMOUNT: ₹${breakdown.total}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAYMENT STATUS: ${bill.status}
${bill.status === 'PAID' ? `Payment Date: ${new Date(bill.paidDate || Date.now()).toLocaleDateString()}` : 'Please pay before due date to avoid penalties'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT INFORMATION:
- This is a computer generated bill
- No signature required
- Pay online at www.mahadiscom.in
- Customer Care: 1912 (Toll Free)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        
        ⚡ POWERING MAHARASHTRA ⚡
    Registered under Govt. of Maharashtra
        License No: MSEDCL/2024/001
        
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `;

      const fileName = `Bill_${bill.meterId}_${getMonthName(bill.month)}_${bill.year}.txt`;
      const fileUri = documentDirectory + fileName;

      await writeAsStringAsync(fileUri, billContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Download Bill',
          UTI: 'public.plain-text'
        });
        Alert.alert('Success', 'Bill downloaded successfully!');
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error downloading bill:', error);
      Alert.alert('Error', 'Failed to download bill. Please try again.');
    }
  };

  const calculateBillBreakdown = (bill) => {
    const energyCharge = bill.total_kwh * 6.5; // ₹6.5 per kWh
    const fixedCharge = 50; // Fixed monthly charge
    const taxRate = 0.18; // 18% GST
    const subtotal = energyCharge + fixedCharge;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      energyCharge: energyCharge.toFixed(2),
      fixedCharge: fixedCharge.toFixed(2),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const renderBillItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.billCard}
      onPress={() => handleBillPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.billHeader}>
        <Text style={styles.billMonth}>
          {getMonthName(item.month)} {item.year}
        </Text>
        <View
          style={[
            styles.statusBadge,
            item.status === 'PAID' ? styles.statusPaid : styles.statusDue,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === 'PAID' ? styles.statusTextPaid : styles.statusTextDue,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.billDetails}>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Energy Consumed</Text>
          <Text style={styles.billValue}>{item.total_kwh.toFixed(2)} kWh</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Amount Due</Text>
          <Text style={styles.billAmount}>₹{item.amount_due.toFixed(2)}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Due Date</Text>
          <Text style={styles.billValue}>
            {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.tapHint}>Tap to view details</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load bills</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Digital Bills</Text>
        <Text style={styles.headerSubtitle}>Meter ID: {METER_ID}</Text>
      </View>

      <FlatList
        data={bills}
        renderItem={renderBillItem}
        keyExtractor={(item) => `${item.month}-${item.year}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bills available</Text>
          </View>
        }
      />

      {/* Bill Details Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedBill && (
                <>
                  {/* Government Watermark Header */}
                  <View style={styles.govHeader}>
                    <View style={styles.govSeal}>
                      <View style={styles.sealOuter}>
                        <View style={styles.sealMiddle}>
                          <View style={styles.sealInner}>
                            <Text style={styles.sealAshoka}>⚡</Text>
                          </View>
                        </View>
                      </View>
                      <Text style={styles.sealMH}>MH</Text>
                    </View>
                    <View style={styles.govInfo}>
                      <Text style={styles.govTitle}>MAHARASHTRA STATE</Text>
                      <Text style={styles.govSubtitle}>ELECTRICITY DISTRIBUTION CO. LTD.</Text>
                      <Text style={styles.govLicense}>Govt. Authorized • License: MSEDCL/2024/001</Text>
                    </View>
                  </View>

                  <View style={styles.watermarkContainer}>
                    <Text style={styles.watermarkText}>🔒 OFFICIAL GOVERNMENT DOCUMENT 🔒</Text>
                  </View>

                  {/* Header */}
                  <View style={styles.detailHeader}>
                    <View>
                      <Text style={styles.detailTitle}>Electricity Bill</Text>
                      <Text style={styles.detailMonth}>
                        {getMonthName(selectedBill.month)} {selectedBill.year}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={closeDetails}
                      style={styles.closeButton}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Status Badge */}
                  <View style={styles.detailStatusContainer}>
                    <View
                      style={[
                        styles.detailStatusBadge,
                        selectedBill.status === 'PAID'
                          ? styles.statusPaid
                          : styles.statusDue,
                      ]}
                    >
                      <Text
                        style={[
                          styles.detailStatusText,
                          selectedBill.status === 'PAID'
                            ? styles.statusTextPaid
                            : styles.statusTextDue,
                        ]}
                      >
                        {selectedBill.status}
                      </Text>
                    </View>
                  </View>

                  {/* Meter Info */}
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Meter Information</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Meter ID:</Text>
                      <Text style={styles.infoValue}>{selectedBill.meterId}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Billing Period:</Text>
                      <Text style={styles.infoValue}>
                        {getMonthName(selectedBill.month)} {selectedBill.year}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Due Date:</Text>
                      <Text style={styles.infoValue}>
                        {new Date(selectedBill.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {/* Usage Details with Stamp */}
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Energy Consumption</Text>
                    <View style={styles.usageCardWithStamp}>
                      <View style={styles.usageCard}>
                        <Text style={styles.usageValue}>
                          {selectedBill.total_kwh.toFixed(2)}
                        </Text>
                        <Text style={styles.usageUnit}>kWh</Text>
                      </View>
                      <View style={styles.stampOverlay}>
                        <View style={styles.govStamp}>
                          <View style={styles.stampCircle}>
                            <Text style={styles.stampAshoka}>⚡</Text>
                          </View>
                          <Text style={styles.stampText}>सत्यमेव जयते</Text>
                          <View style={styles.stampDivider} />
                          <Text style={styles.stampSubtext}>GOVERNMENT OF</Text>
                          <Text style={styles.stampState}>MAHARASHTRA</Text>
                          <View style={styles.stampDivider} />
                          <Text style={styles.stampYear}>EST. 1960</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Average Daily:</Text>
                      <Text style={styles.infoValue}>
                        {(selectedBill.total_kwh / 30).toFixed(2)} kWh
                      </Text>
                    </View>
                  </View>

                  {/* Charges Breakdown */}
                  {(() => {
                    const breakdown = calculateBillBreakdown(selectedBill);
                    return (
                      <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Charges Breakdown</Text>
                        
                        <View style={styles.chargeRow}>
                          <Text style={styles.chargeLabel}>
                            Energy Charges ({selectedBill.total_kwh.toFixed(2)} kWh × ₹6.50)
                          </Text>
                          <Text style={styles.chargeValue}>₹{breakdown.energyCharge}</Text>
                        </View>
                        
                        <View style={styles.chargeRow}>
                          <Text style={styles.chargeLabel}>Fixed Charges</Text>
                          <Text style={styles.chargeValue}>₹{breakdown.fixedCharge}</Text>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.chargeRow}>
                          <Text style={styles.chargeLabel}>Subtotal</Text>
                          <Text style={styles.chargeValue}>₹{breakdown.subtotal}</Text>
                        </View>
                        
                        <View style={styles.chargeRow}>
                          <Text style={styles.chargeLabel}>GST (18%)</Text>
                          <Text style={styles.chargeValue}>₹{breakdown.tax}</Text>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.totalRow}>
                          <Text style={styles.totalLabel}>Total Amount</Text>
                          <Text style={styles.totalValue}>₹{breakdown.total}</Text>
                        </View>
                      </View>
                    );
                  })()}

                  {/* Payment Status */}
                  {selectedBill.status === 'PAID' && selectedBill.paidDate && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Payment Information</Text>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Paid On:</Text>
                        <Text style={styles.infoValue}>
                          {new Date(selectedBill.paidDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.paidBadge}>
                        <Text style={styles.paidBadgeText}>✓ Payment Received</Text>
                      </View>
                    </View>
                  )}

                  {selectedBill.status === 'DUE' && (
                    <View style={styles.detailSection}>
                      <TouchableOpacity style={styles.payButton}>
                        <Text style={styles.payButtonText}>Pay Now</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Download Button */}
                  <View style={styles.detailSection}>
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={() => downloadBill(selectedBill)}
                    >
                      <Text style={styles.downloadIcon}>📄</Text>
                      <Text style={styles.downloadButtonText}>Download Bill</Text>
                    </TouchableOpacity>
                    <Text style={styles.downloadHint}>
                      Download official bill with government seal
                    </Text>
                  </View>

                  {/* Footer */}
                  <View style={styles.billFooter}>
                    <Text style={styles.footerText}>⚡ This is a computer generated bill</Text>
                    <Text style={styles.footerText}>No signature required</Text>
                    <Text style={styles.footerSmall}>Customer Care: 1912 (Toll Free)</Text>
                    <Text style={styles.footerSmall}>www.mahadiscom.in</Text>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingTop: 24,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  listContainer: {
    padding: 16,
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
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  billMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPaid: {
    backgroundColor: '#E8F5E9',
  },
  statusDue: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextPaid: {
    color: '#4CAF50',
  },
  statusTextDue: {
    color: '#f44336',
  },
  billDetails: {
    gap: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontSize: 14,
    color: '#666',
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  billAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  tapHint: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  govHeader: {
    backgroundColor: '#1565C0',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  govSeal: {
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  sealOuter: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  sealMiddle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1565C0',
  },
  sealInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sealAshoka: {
    fontSize: 28,
    color: '#FFC107',
    fontWeight: 'bold',
  },
  sealMH: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#1565C0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    bottom: -2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  govInfo: {
    flex: 1,
  },
  govTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  govSubtitle: {
    fontSize: 12,
    color: '#E3F2FD',
    marginTop: 2,
    marginBottom: 4,
  },
  govLicense: {
    fontSize: 10,
    color: '#BBDEFB',
  },
  watermarkContainer: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#1565C0',
    borderStyle: 'dashed',
  },
  watermarkText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1565C0',
    letterSpacing: 1.5,
  },
  govStamp: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(21, 101, 192, 0.12)',
    borderWidth: 3,
    borderColor: '#1565C0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  stampCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stampAshoka: {
    fontSize: 20,
    color: '#FFC107',
    fontWeight: 'bold',
  },
  stampText: {
    fontSize: 8,
    color: '#1565C0',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 3,
  },
  stampDivider: {
    width: 35,
    height: 1,
    backgroundColor: '#1565C0',
    marginVertical: 2,
  },
  stampSubtext: {
    fontSize: 6,
    color: '#1565C0',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  stampState: {
    fontSize: 10,
    color: '#1565C0',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 1,
    letterSpacing: 0.5,
  },
  stampYear: {
    fontSize: 6,
    color: '#1565C0',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailMonth: {
    fontSize: 16,
    color: '#666',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  detailStatusContainer: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  detailStatusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailStatusText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailSection: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  usageCardWithStamp: {
    position: 'relative',
    marginBottom: 16,
  },
  usageCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  stampOverlay: {
    position: 'absolute',
    right: -10,
    top: -10,
    transform: [{ rotate: '15deg' }],
  },
  usageValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  usageUnit: {
    fontSize: 18,
    color: '#66BB6A',
    marginTop: 4,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chargeLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 12,
  },
  chargeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paidBadge: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  paidBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  downloadButton: {
    backgroundColor: '#1565C0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  downloadIcon: {
    fontSize: 20,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  downloadHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  billFooter: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#1565C0',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  footerSmall: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
});

export default BillingScreen;
