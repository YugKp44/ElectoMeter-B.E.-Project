import axios from 'axios';
import {
  generateMockLiveReading,
  generateMockHistoricalReadings,
  generateMockBills,
} from './mockData';

// Production API URL (Render)
const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://electometer-b-e-project.onrender.com/api'
).trim();

console.log('[API] Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const SOURCE_REAL = 'real';
const SOURCE_MOCK = 'mock';

function isNotFound(error) {
  return Number(error?.response?.status) === 404;
}

function withSource(data, source, reason = null) {
  return {
    data,
    source,
    reason,
  };
}

export const getLiveReadingWithSource = async (meterId) => {
  try {
    const response = await api.get(`/meters/${meterId}/live`);
    if (response?.data && response.data.timestamp) {
      return withSource(response.data, SOURCE_REAL);
    }

    return withSource(
      generateMockLiveReading(meterId),
      SOURCE_MOCK,
      'empty_payload',
    );
  } catch (error) {
    const reason = isNotFound(error) ? 'no_real_reading' : 'api_error';
    console.warn(`[API] Falling back to simulated live reading (${reason})`);
    return withSource(generateMockLiveReading(meterId), SOURCE_MOCK, reason);
  }
};

export const getHistoricalReadingsWithSource = async (meterId, period = '24h') => {
  try {
    const response = await api.get(`/meters/${meterId}/history`, {
      params: { period },
    });

    const realData = Array.isArray(response?.data) ? response.data : [];
    if (realData.length > 0) {
      return withSource(realData, SOURCE_REAL);
    }

    return withSource(
      generateMockHistoricalReadings(meterId, period),
      SOURCE_MOCK,
      'empty_history',
    );
  } catch (error) {
    const reason = isNotFound(error) ? 'no_history' : 'api_error';
    console.warn(`[API] Falling back to simulated history (${reason})`);
    return withSource(generateMockHistoricalReadings(meterId, period), SOURCE_MOCK, reason);
  }
};

export const getBillsWithSource = async (meterId) => {
  try {
    const response = await api.get(`/meters/${meterId}/bills`);
    const realBills = Array.isArray(response?.data) ? response.data : [];

    if (realBills.length > 0) {
      return withSource(realBills, SOURCE_REAL);
    }

    return withSource(generateMockBills(meterId), SOURCE_MOCK, 'empty_bills');
  } catch (error) {
    const reason = isNotFound(error) ? 'no_bills' : 'api_error';
    console.warn(`[API] Falling back to simulated bills (${reason})`);
    return withSource(generateMockBills(meterId), SOURCE_MOCK, reason);
  }
};

// Get live reading for a meter
export const getLiveReading = async (meterId) => {
  const result = await getLiveReadingWithSource(meterId);
  return result.data;
};

// Get historical readings for a meter
export const getHistoricalReadings = async (meterId, period = '24h') => {
  const result = await getHistoricalReadingsWithSource(meterId, period);
  return result.data;
};

// Get bills for a meter
export const getBills = async (meterId) => {
  const result = await getBillsWithSource(meterId);
  return result.data;
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

// Get actionable insights for a meter
export const getMeterInsights = async (meterId) => {
  try {
    const response = await api.get(`/meters/${meterId}/insights`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meter insights:', {
      message: error?.message,
      baseURL: API_BASE_URL,
      path: `/meters/${meterId}/insights`,
    });
    throw error;
  }
};

// Get ESP ingestion/serial stream status
export const getEspStatus = async () => {
  try {
    const response = await api.get('/esp/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching ESP status:', error);
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

// Trigger admin demo event for presentation
export const triggerDemoEvent = async (meterId, eventType) => {
  try {
    const response = await api.post(`/admin/demo/${meterId}/trigger`, { eventType });
    return response.data;
  } catch (error) {
    console.error('Error triggering demo event:', error);
    throw error;
  }
};

export default {
  getLiveReading,
  getLiveReadingWithSource,
  getHistoricalReadings,
  getHistoricalReadingsWithSource,
  getBills,
  getBillsWithSource,
  getAlerts,
  getMeterInsights,
  getEspStatus,
  adminLogin,
  getSystemStats,
  getAllMeters,
  getMeterDetails,
  getAllBills,
  updateBillStatus,
  getAllAlerts,
  getAreaWiseAnalytics,
  getConsumptionPrediction,
  triggerDemoEvent,
};
