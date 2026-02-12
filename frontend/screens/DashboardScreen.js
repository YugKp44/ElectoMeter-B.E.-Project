import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  RefreshControl, 
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LiveUsageCard from '../components/LiveUsageCard';
import UsageHistoryChart from '../components/UsageHistoryChart';
import PeriodSelector from '../components/PeriodSelector';
import { getLiveReading, getHistoricalReadings } from '../services/api';

const METER_ID = 'MTR-1001';
const POLL_INTERVAL = 5000; // 5 seconds

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

const DashboardScreen = ({ route }) => {
  const { switchToAdmin } = route.params || {};
  const [liveData, setLiveData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [loadingLive, setLoadingLive] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorLive, setErrorLive] = useState(false);
  const [errorHistory, setErrorHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Admin login modal states
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Fetch live data
  const fetchLiveData = async () => {
    try {
      const data = await getLiveReading(METER_ID);
      setLiveData(data);
      setErrorLive(false);
    } catch (error) {
      console.error('Error fetching live data:', error);
      setErrorLive(true);
    } finally {
      setLoadingLive(false);
    }
  };

  // Fetch historical data
  const fetchHistoryData = async (period) => {
    try {
      setLoadingHistory(true);
      const data = await getHistoricalReadings(METER_ID, period);
      setHistoryData(data);
      setErrorHistory(false);
    } catch (error) {
      console.error('Error fetching history data:', error);
      setErrorHistory(true);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchLiveData();
    fetchHistoryData(selectedPeriod);
  }, []);

  // Poll live data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveData();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Fetch history when period changes
  useEffect(() => {
    fetchHistoryData(selectedPeriod);
  }, [selectedPeriod]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLiveData(), fetchHistoryData(selectedPeriod)]);
    setRefreshing(false);
  };

  // Handle admin button press - show login modal
  const handleAdminButtonPress = () => {
    setShowAdminLogin(true);
  };

  // Handle admin login
  const handleAdminLogin = () => {
    if (!adminUsername || !adminPassword) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setAdminLoading(true);

    setTimeout(() => {
      if (adminUsername === ADMIN_CREDENTIALS.username && adminPassword === ADMIN_CREDENTIALS.password) {
        setAdminLoading(false);
        setShowAdminLogin(false);
        setAdminUsername('');
        setAdminPassword('');
        if (switchToAdmin) {
          switchToAdmin();
        }
      } else {
        setAdminLoading(false);
        Alert.alert('Login Failed', 'Invalid admin credentials');
      }
    }, 500);
  };

  const closeAdminLogin = () => {
    setShowAdminLogin(false);
    setAdminUsername('');
    setAdminPassword('');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Meter ID: {METER_ID}</Text>
          </View>
          {switchToAdmin && (
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={handleAdminButtonPress}
            >
              <Text style={styles.adminButtonIcon}>⚙️</Text>
              <Text style={styles.adminButtonText}>Admin Panel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <LiveUsageCard data={liveData} loading={loadingLive} error={errorLive} />

      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
      />

      <UsageHistoryChart
        data={historyData}
        loading={loadingHistory}
        error={errorHistory}
        period={selectedPeriod}
      />

      {/* Admin Login Modal */}
      <Modal
        visible={showAdminLogin}
        animationType="slide"
        transparent={true}
        onRequestClose={closeAdminLogin}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#FF6B6B', '#EE5A6F']}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Admin Login</Text>
              <TouchableOpacity onPress={closeAdminLogin} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoIcon}>🔐</Text>
              </View>
              <Text style={styles.welcomeText}>Restricted Access</Text>
              <Text style={styles.subtitleText}>Enter admin credentials to continue</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Admin Username"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={adminUsername}
                  onChangeText={setAdminUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={adminPassword}
                  onChangeText={setAdminPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleAdminLogin}
                disabled={adminLoading}
              >
                {adminLoading ? (
                  <ActivityIndicator color="#FF6B6B" />
                ) : (
                  <Text style={styles.loginButtonText}>Access Admin Panel</Text>
                )}
              </TouchableOpacity>

              <View style={styles.demoInfo}>
                <Text style={styles.demoText}>Demo: admin / admin123</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingTop: 24,
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  adminButtonIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 40,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DashboardScreen;
