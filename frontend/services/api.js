import axios from 'axios';

// Update this URL to match your backend server
// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, use localhost
// For physical device, use your computer's IP address (currently: 10.208.146.161)
const API_BASE_URL = 'http://10.208.146.161:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get live reading for a meter
export const getLiveReading = async (meterId) => {
  try {
    const response = await api.get(`/meters/${meterId}/live`);
    return response.data;
  } catch (error) {
    console.error('Error fetching live reading:', error);
    throw error;
  }
};

// Get historical readings for a meter
export const getHistoricalReadings = async (meterId, period = '24h') => {
  try {
    const response = await api.get(`/meters/${meterId}/history`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical readings:', error);
    throw error;
  }
};

// Get bills for a meter
export const getBills = async (meterId) => {
  try {
    const response = await api.get(`/meters/${meterId}/bills`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bills:', error);
    throw error;
  }
};

// Get alerts for a meter
export const getAlerts = async (meterId) => {
  try {
    const response = await api.get(`/meters/${meterId}/alerts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

// Admin API calls
// Admin login
export const adminLogin = async (username, password) => {
  try {
    const response = await api.post('/admin/login', { username, password });
    return response.data;
  } catch (error) {
    console.error('Error during admin login:', error);
    throw error;
  }
};

// Get system statistics
export const getSystemStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching system stats:', error);
    throw error;
  }
};

// Get all meters
export const getAllMeters = async () => {
  try {
    const response = await api.get('/admin/meters');
    return response.data;
  } catch (error) {
    console.error('Error fetching all meters:', error);
    throw error;
  }
};

// Get meter details
export const getMeterDetails = async (meterId) => {
  try {
    const response = await api.get(`/admin/meters/${meterId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meter details:', error);
    throw error;
  }
};

// Get all bills
export const getAllBills = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await api.get('/admin/bills', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all bills:', error);
    throw error;
  }
};

// Update bill status
export const updateBillStatus = async (billId, status) => {
  try {
    const response = await api.put(`/admin/bills/${billId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating bill status:', error);
    throw error;
  }
};

// Get all alerts
export const getAllAlerts = async (type = null) => {
  try {
    const params = type ? { type } : {};
    const response = await api.get('/admin/alerts', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all alerts:', error);
    throw error;
  }
};

// Get area-wise analytics
export const getAreaWiseAnalytics = async () => {
  try {
    const response = await api.get('/admin/analytics/area-wise');
    return response.data;
  } catch (error) {
    console.error('Error fetching area-wise analytics:', error);
    throw error;
  }
};

// Get consumption prediction
export const getConsumptionPrediction = async (days = 30) => {
  try {
    const response = await api.get('/admin/analytics/prediction', { params: { days } });
    return response.data;
  } catch (error) {
    console.error('Error fetching consumption prediction:', error);
    throw error;
  }
};

export default {
  getLiveReading,
  getHistoricalReadings,
  getBills,
  getAlerts,
  adminLogin,
  getSystemStats,
  getAllMeters,
  getMeterDetails,
  getAllBills,
  updateBillStatus,
  getAllAlerts,
  getAreaWiseAnalytics,
  getConsumptionPrediction,
};
