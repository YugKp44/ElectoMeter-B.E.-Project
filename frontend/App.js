import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import BillingScreen from './screens/BillingScreen';
import AlertsScreen from './screens/AlertsScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminMetersScreen from './screens/AdminMetersScreen';
import AdminAlertsScreen from './screens/AdminAlertsScreen';
import AdminUsersScreen from './screens/AdminUsersScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'user' or 'admin'
  const [userData, setUserData] = useState(null);

  const handleLogin = (role, data) => {
    setUserRole(role);
    setUserData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserData(null);
  };

  const switchToAdmin = () => {
    setUserRole('admin');
  };

  const switchToUser = () => {
    setUserRole('user');
  };

  // Show animated splash screen on launch
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Admin Portal Navigation
  if (userRole === 'admin') {
    return (
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#FF6B6B',
            tabBarInactiveTintColor: '#999',
            tabBarStyle: {
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            headerShown: true,
            headerStyle: {
              backgroundColor: '#FF6B6B',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerRight: () => (
              <View style={styles.headerButtons}>
                <TouchableOpacity onPress={switchToUser} style={styles.switchButton}>
                  <Text style={styles.switchText}>👤 User</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            ),
          }}
        >
          <Tab.Screen
            name="Dashboard"
            component={AdminDashboardScreen}
            options={{
              headerShown: false,
              tabBarLabel: 'Overview',
              tabBarIcon: ({ color, size }) => (
                <TabIcon icon="📊" color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Meters"
            component={AdminMetersScreen}
            options={{
              headerShown: false,
              tabBarLabel: 'Meters',
              tabBarIcon: ({ color, size }) => (
                <TabIcon icon="⚡" color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Users"
            component={AdminUsersScreen}
            options={{
              headerShown: false,
              tabBarLabel: 'Users',
              tabBarIcon: ({ color, size }) => (
                <TabIcon icon="👥" color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Alerts"
            component={AdminAlertsScreen}
            options={{
              headerShown: false,
              tabBarLabel: 'Alerts',
              tabBarIcon: ({ color, size }) => (
                <TabIcon icon="🔔" color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }

  // User Portal Navigation (default)
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={switchToAdmin} style={styles.switchButton}>
                <Text style={styles.switchText}>⚙️ Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <TabIcon icon="📊" color={color} />
            ),
          }}
          initialParams={{ switchToAdmin }}
        />
        <Tab.Screen
          name="Billing"
          component={BillingScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Billing',
            tabBarIcon: ({ color, size }) => (
              <TabIcon icon="💳" color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Alerts"
          component={AlertsScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Alerts',
            tabBarIcon: ({ color, size }) => (
              <TabIcon icon="🔔" color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Simple tab icon component using emoji
const TabIcon = ({ icon, color }) => {
  return (
    <Text style={{ fontSize: 24 }}>
      {icon}
    </Text>
  );
};

const styles = StyleSheet.create({
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 8,
  },
  switchButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  switchText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
