# Smart Energy Meter System - Frontend

## Overview
React Native mobile application for the Smart Energy Meter simulation system. Displays real-time energy consumption, historical usage, digital bills, and system alerts.

## Features
- **Dashboard**: Real-time power monitoring with live updates every 5 seconds
- **Historical Charts**: Interactive line charts with 6H, 24H, and 7D views
- **Digital Billing**: View all past and current bills with payment status
- **Alerts System**: Real-time notifications for anomalies and high usage
- **Pull-to-Refresh**: Update data with a simple pull gesture

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (optional, for easier development)
- Backend server running on http://localhost:3000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API endpoint:
Edit `services/api.js` and update the `API_BASE_URL`:
- For Android Emulator: `http://10.0.2.2:3000/api`
- For iOS Simulator: `http://localhost:3000/api`
- For Physical Device: `http://YOUR_COMPUTER_IP:3000/api`

## Running the App

Start the development server:
```bash
npm start
```

This will open Expo DevTools in your browser. From there you can:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan QR code with Expo Go app on your physical device

Run on specific platforms:
```bash
npm run android   # Run on Android
npm run ios       # Run on iOS
npm run web       # Run on web browser
```

## Project Structure
```
frontend/
├── screens/          # Main screen components
│   ├── DashboardScreen.js
│   ├── BillingScreen.js
│   └── AlertsScreen.js
├── components/       # Reusable UI components
│   ├── LiveUsageCard.js
│   ├── UsageHistoryChart.js
│   └── PeriodSelector.js
├── services/         # API integration
│   └── api.js
├── App.js           # Main app with navigation
└── package.json     # Dependencies
```

## Screens

### Dashboard
- **Live Usage Card**: Displays current power consumption, voltage, and current
- **Period Selector**: Toggle between 6H, 24H, and 7D views
- **Usage Chart**: Interactive line chart of historical power consumption
- **Auto-refresh**: Updates every 5 seconds

### Billing
- **Bill List**: Shows all historical bills
- **Status Indicators**: Color-coded for DUE (red) and PAID (green)
- **Details**: Energy consumed (kWh), amount due (₹), and due date

### Alerts
- **Alert List**: All system-generated notifications
- **Alert Types**: 
  - ⚠️ Theft Suspicion (red)
  - 📊 High Usage (orange)
- **Timestamps**: When each alert was generated

## API Configuration

The app connects to the backend API. Make sure to update the base URL in `services/api.js`:

```javascript
const API_BASE_URL = 'http://YOUR_IP:3000/api';
```

### Finding Your IP Address:
- **Windows**: Run `ipconfig` in Command Prompt
- **Mac/Linux**: Run `ifconfig` in Terminal
- Look for your local IP (usually starts with 192.168.x.x)

## Dependencies
- **expo**: Development framework
- **react-navigation**: Navigation library
- **axios**: HTTP client
- **react-native-chart-kit**: Charting library
- **react-native-svg**: SVG support for charts

## Troubleshooting

### Cannot connect to API
1. Make sure backend server is running
2. Check that API_BASE_URL is correct
3. For physical devices, ensure phone and computer are on same WiFi
4. Disable any firewall blocking port 3000

### Charts not displaying
1. Check that backend is returning data
2. Verify period parameter is valid (6h, 24h, 7d)
3. Check console for errors

### App crashes on startup
1. Clear cache: `expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check that all dependencies are installed

## Development Notes

- The app polls the live reading endpoint every 5 seconds
- Pull-to-refresh is available on all screens
- Historical data is fetched when period changes
- All timestamps are formatted to local timezone
- Currency is displayed in Indian Rupees (₹)
