import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const DEMO_CREDENTIALS = {
  user: {
    username: 'demo',
    password: 'demo123',
  },
  admin: {
    username: 'admin',
    password: 'admin123',
  },
};

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      if (loginType === 'admin') {
        // Admin login check
        if (username === DEMO_CREDENTIALS.admin.username && password === DEMO_CREDENTIALS.admin.password) {
          onLogin('admin', { username, role: 'admin' });
        } else {
          Alert.alert('Login Failed', 'Invalid admin credentials');
          setLoading(false);
        }
      } else {
        // User login check
        if (username === DEMO_CREDENTIALS.user.username && password === DEMO_CREDENTIALS.user.password) {
          onLogin('user', { username, meterId: 'MTR-1001' });
        } else {
          Alert.alert('Login Failed', 'Invalid username or password');
          setLoading(false);
        }
      }
    }, 500);
  };

  const fillDemoCredentials = () => {
    if (loginType === 'admin') {
      setUsername(DEMO_CREDENTIALS.admin.username);
      setPassword(DEMO_CREDENTIALS.admin.password);
    } else {
      setUsername(DEMO_CREDENTIALS.user.username);
      setPassword(DEMO_CREDENTIALS.user.password);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={loginType === 'admin' ? ['#FF6B6B', '#E74C3C', '#C0392B'] : ['#4CAF50', '#45a049', '#2E7D32']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo/Icon Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>{loginType === 'admin' ? '👨‍💼' : '⚡'}</Text>
            </View>
            <Text style={styles.title}>Smart Meter</Text>
            <Text style={styles.subtitle}>
              {loginType === 'admin' ? 'Admin Portal' : 'Energy Monitoring System'}
            </Text>
          </View>

          {/* Role Selector */}
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleButton, loginType === 'user' && styles.roleButtonActive]}
              onPress={() => {
                setLoginType('user');
                setUsername('');
                setPassword('');
              }}
            >
              <Text style={[styles.roleButtonText, loginType === 'user' && styles.roleButtonTextActive]}>
                User Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, loginType === 'admin' && styles.roleButtonActive]}
              onPress={() => {
                setLoginType('admin');
                setUsername('');
                setPassword('');
              }}
            >
              <Text style={[styles.roleButtonText, loginType === 'admin' && styles.roleButtonTextActive]}>
                Admin Login
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Demo Credentials Button */}
            <TouchableOpacity
              style={styles.demoButton}
              onPress={fillDemoCredentials}
            >
              <Text style={styles.demoButtonText}>
                Use Demo Credentials
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            {/* Demo Info */}
            <View style={styles.demoInfo}>
              <Text style={styles.demoInfoTitle}>
                {loginType === 'admin' ? 'Admin Credentials:' : 'Demo Credentials:'}
              </Text>
              <Text style={styles.demoInfoText}>
                Username: {loginType === 'admin' ? 'admin' : 'demo'}
              </Text>
              <Text style={styles.demoInfoText}>
                Password: {loginType === 'admin' ? 'admin123' : 'demo123'}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              B.E. Project - Smart Energy Meter System
            </Text>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoIcon: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  demoInfoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  demoInfoText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  roleSelector: {
    flexDirection: 'row',
    marginHorizontal: 30,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  roleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#4CAF50',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default LoginScreen;
