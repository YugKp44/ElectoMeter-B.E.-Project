import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';

const AdminUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock user data with 50 realistic users across 5 zones
  const mockUsers = [
    // Zone A - Andheri Residential (Lower consumption)
    { id: 'MTR-1001', name: 'Rajesh Kumar', area: 'Zone A', status: 'active', consumption: 342, lastBill: 2736, phone: '+91 98765 43210' },
    { id: 'MTR-1002', name: 'Priya Sharma', area: 'Zone A', status: 'active', consumption: 289, lastBill: 2312, phone: '+91 98765 43211' },
    { id: 'MTR-1003', name: 'Amit Patel', area: 'Zone A', status: 'active', consumption: 421, lastBill: 3368, phone: '+91 98765 43212' },
    { id: 'MTR-1004', name: 'Sneha Deshmukh', area: 'Zone A', status: 'warning', consumption: 378, lastBill: 3024, phone: '+91 98765 43213' },
    { id: 'MTR-1005', name: 'Vikram Singh', area: 'Zone A', status: 'active', consumption: 412, lastBill: 3296, phone: '+91 98765 43214' },
    { id: 'MTR-1006', name: 'Meera Iyer', area: 'Zone A', status: 'active', consumption: 298, lastBill: 2384, phone: '+91 98765 43215' },
    { id: 'MTR-1007', name: 'Arjun Kapoor', area: 'Zone A', status: 'active', consumption: 445, lastBill: 3560, phone: '+91 98765 43216' },
    { id: 'MTR-1008', name: 'Kavita Reddy', area: 'Zone A', status: 'active', consumption: 367, lastBill: 2936, phone: '+91 98765 43217' },
    { id: 'MTR-1009', name: 'Sanjay Gupta', area: 'Zone A', status: 'inactive', consumption: 156, lastBill: 1248, phone: '+91 98765 43218' },
    { id: 'MTR-1010', name: 'Pooja Malhotra', area: 'Zone A', status: 'active', consumption: 334, lastBill: 2672, phone: '+91 98765 43219' },
    
    // Zone B - BKC Commercial (High consumption)
    { id: 'MTR-1011', name: 'Tech Solutions Pvt Ltd', area: 'Zone B', status: 'active', consumption: 2340, lastBill: 18720, phone: '+91 98765 43220' },
    { id: 'MTR-1012', name: 'Infosys Technologies', area: 'Zone B', status: 'active', consumption: 3450, lastBill: 27600, phone: '+91 98765 43221' },
    { id: 'MTR-1013', name: 'ICICI Bank Corporate', area: 'Zone B', status: 'active', consumption: 2890, lastBill: 23120, phone: '+91 98765 43222' },
    { id: 'MTR-1014', name: 'Reliance Industries Office', area: 'Zone B', status: 'active', consumption: 4120, lastBill: 32960, phone: '+91 98765 43223' },
    { id: 'MTR-1015', name: 'Green Cafe & Restaurant', area: 'Zone B', status: 'active', consumption: 1890, lastBill: 15120, phone: '+91 98765 43224' },
    { id: 'MTR-1016', name: 'Style Fashion Store', area: 'Zone B', status: 'warning', consumption: 1678, lastBill: 13424, phone: '+91 98765 43225' },
    { id: 'MTR-1017', name: 'FitZone Gym', area: 'Zone B', status: 'active', consumption: 2120, lastBill: 16960, phone: '+91 98765 43226' },
    { id: 'MTR-1018', name: 'Mumbai Hotel & Suites', area: 'Zone B', status: 'active', consumption: 3890, lastBill: 31120, phone: '+91 98765 43227' },
    { id: 'MTR-1019', name: 'StarBucks Coffee', area: 'Zone B', status: 'active', consumption: 1456, lastBill: 11648, phone: '+91 98765 43228' },
    { id: 'MTR-1020', name: 'PVR Cinemas', area: 'Zone B', status: 'active', consumption: 3240, lastBill: 25920, phone: '+91 98765 43229' },
    
    // Zone C - MIDC Industrial (Very high consumption)
    { id: 'MTR-1021', name: 'ABC Manufacturing Ltd', area: 'Zone C', status: 'active', consumption: 5670, lastBill: 45360, phone: '+91 98765 43230' },
    { id: 'MTR-1022', name: 'Precision Tools Co.', area: 'Zone C', status: 'active', consumption: 4890, lastBill: 39120, phone: '+91 98765 43231' },
    { id: 'MTR-1023', name: 'Metro Textiles', area: 'Zone C', status: 'warning', consumption: 5120, lastBill: 40960, phone: '+91 98765 43232' },
    { id: 'MTR-1024', name: 'Steel Industries Ltd', area: 'Zone C', status: 'active', consumption: 6780, lastBill: 54240, phone: '+91 98765 43233' },
    { id: 'MTR-1025', name: 'Pharma Labs India', area: 'Zone C', status: 'active', consumption: 4320, lastBill: 34560, phone: '+91 98765 43234' },
    { id: 'MTR-1026', name: 'Auto Parts Manufacturing', area: 'Zone C', status: 'active', consumption: 5450, lastBill: 43600, phone: '+91 98765 43235' },
    { id: 'MTR-1027', name: 'Chemical Solutions Pvt Ltd', area: 'Zone C', status: 'active', consumption: 4990, lastBill: 39920, phone: '+91 98765 43236' },
    { id: 'MTR-1028', name: 'Packaging Industries', area: 'Zone C', status: 'warning', consumption: 3890, lastBill: 31120, phone: '+91 98765 43237' },
    { id: 'MTR-1029', name: 'Electronics Assembly Unit', area: 'Zone C', status: 'active', consumption: 5230, lastBill: 41840, phone: '+91 98765 43238' },
    { id: 'MTR-1030', name: 'Food Processing Plant', area: 'Zone C', status: 'active', consumption: 6120, lastBill: 48960, phone: '+91 98765 43239' },
    
    // Zone D - Bandra Mixed Use (Medium consumption)
    { id: 'MTR-1031', name: 'Sunita Desai', area: 'Zone D', status: 'active', consumption: 456, lastBill: 3648, phone: '+91 98765 43240' },
    { id: 'MTR-1032', name: 'Rahul Nair', area: 'Zone D', status: 'active', consumption: 523, lastBill: 4184, phone: '+91 98765 43241' },
    { id: 'MTR-1033', name: 'Smart Mart Supermarket', area: 'Zone D', status: 'active', consumption: 1456, lastBill: 11648, phone: '+91 98765 43242' },
    { id: 'MTR-1034', name: 'Dr. Mehta Clinic', area: 'Zone D', status: 'inactive', consumption: 234, lastBill: 1872, phone: '+91 98765 43243' },
    { id: 'MTR-1035', name: 'Neha Chopra', area: 'Zone D', status: 'active', consumption: 489, lastBill: 3912, phone: '+91 98765 43244' },
    { id: 'MTR-1036', name: 'Karan Johar Residence', area: 'Zone D', status: 'active', consumption: 678, lastBill: 5424, phone: '+91 98765 43245' },
    { id: 'MTR-1037', name: 'Bandra Cafe Lounge', area: 'Zone D', status: 'active', consumption: 890, lastBill: 7120, phone: '+91 98765 43246' },
    { id: 'MTR-1038', name: 'The Bookstore', area: 'Zone D', status: 'warning', consumption: 445, lastBill: 3560, phone: '+91 98765 43247' },
    { id: 'MTR-1039', name: 'Yoga Studio Wellness', area: 'Zone D', status: 'active', consumption: 567, lastBill: 4536, phone: '+91 98765 43248' },
    { id: 'MTR-1040', name: 'Dental Care Clinic', area: 'Zone D', status: 'active', consumption: 723, lastBill: 5784, phone: '+91 98765 43249' },
    
    // Zone E - Goregaon High-Rise (High consumption - multiple units)
    { id: 'MTR-1041', name: 'Skyline Towers - Wing A', area: 'Zone E', status: 'active', consumption: 2890, lastBill: 23120, phone: '+91 98765 43250' },
    { id: 'MTR-1042', name: 'Skyline Towers - Wing B', area: 'Zone E', status: 'active', consumption: 3120, lastBill: 24960, phone: '+91 98765 43251' },
    { id: 'MTR-1043', name: 'Ocean View Apartments', area: 'Zone E', status: 'active', consumption: 2678, lastBill: 21424, phone: '+91 98765 43252' },
    { id: 'MTR-1044', name: 'Metro Heights Complex', area: 'Zone E', status: 'warning', consumption: 2345, lastBill: 18760, phone: '+91 98765 43253' },
    { id: 'MTR-1045', name: 'Royal Residency - Tower 1', area: 'Zone E', status: 'active', consumption: 3456, lastBill: 27648, phone: '+91 98765 43254' },
    { id: 'MTR-1046', name: 'Royal Residency - Tower 2', area: 'Zone E', status: 'active', consumption: 3289, lastBill: 26312, phone: '+91 98765 43255' },
    { id: 'MTR-1047', name: 'Green Park Society', area: 'Zone E', status: 'active', consumption: 2567, lastBill: 20536, phone: '+91 98765 43256' },
    { id: 'MTR-1048', name: 'Sunrise Apartments', area: 'Zone E', status: 'active', consumption: 2890, lastBill: 23120, phone: '+91 98765 43257' },
    { id: 'MTR-1049', name: 'Elite Towers', area: 'Zone E', status: 'active', consumption: 3123, lastBill: 24984, phone: '+91 98765 43258' },
    { id: 'MTR-1050', name: 'Paradise Residency', area: 'Zone E', status: 'active', consumption: 2745, lastBill: 21960, phone: '+91 98765 43259' },
  ];

  const fetchUsers = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        setLoading(false);
        setRefreshing(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedFilter]);

  const filterUsers = () => {
    let filtered = users;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(user => user.status === selectedFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.area.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'inactive': return '#F44336';
      default: return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '●';
      case 'warning': return '⚠';
      case 'inactive': return '○';
      default: return '●';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Users...</Text>
      </View>
    );
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    warning: users.filter(u => u.status === 'warning').length,
    inactive: users.filter(u => u.status === 'inactive').length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>User Management</Text>
            <Text style={styles.headerSubtitle}>{stats.total} Total Users</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Text style={[styles.statDot, { color: '#4CAF50' }]}>●</Text>
              <Text style={styles.statText}>{stats.active}</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={[styles.statDot, { color: '#FF9800' }]}>●</Text>
              <Text style={styles.statText}>{stats.warning}</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={[styles.statDot, { color: '#F44336' }]}>●</Text>
              <Text style={styles.statText}>{stats.inactive}</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, meter ID, or area..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'active' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('active')}
          >
            <Text style={[styles.filterText, selectedFilter === 'active' && styles.filterTextActive]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'warning' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('warning')}
          >
            <Text style={[styles.filterText, selectedFilter === 'warning' && styles.filterTextActive]}>Warning</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'inactive' && styles.filterButtonActive]}
            onPress={() => setSelectedFilter('inactive')}
          >
            <Text style={[styles.filterText, selectedFilter === 'inactive' && styles.filterTextActive]}>Inactive</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
      >
        <View style={styles.content}>
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No users found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          ) : (
            filteredUsers.map((user, index) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) }]}>
                        <Text style={styles.statusIcon}>{getStatusIcon(user.status)}</Text>
                        <Text style={styles.statusText}>{user.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.userId}>Meter: {user.id}</Text>
                    <Text style={styles.userArea}>📍 {user.area}</Text>
                  </View>
                </View>

                <View style={styles.userStats}>
                  <View style={styles.userStat}>
                    <Text style={styles.statLabel}>Consumption</Text>
                    <Text style={styles.statValue}>{user.consumption} kWh</Text>
                    <Text style={styles.statSubtext}>Last 30 days</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.userStat}>
                    <Text style={styles.statLabel}>Last Bill</Text>
                    <Text style={styles.statValue}>₹{user.lastBill}</Text>
                    <Text style={styles.statSubtext}>Current month</Text>
                  </View>
                </View>

                <View style={styles.userFooter}>
                  <Text style={styles.phoneText}>📞 {user.phone}</Text>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Details →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
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
    marginBottom: 16,
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statDot: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  filterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FF6B6B',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusIcon: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userId: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  userArea: {
    fontSize: 13,
    color: '#666',
  },
  userStats: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  userStat: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: '#999',
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 13,
    color: '#666',
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default AdminUsersScreen;
