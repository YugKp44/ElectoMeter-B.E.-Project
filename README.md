# Smart Energy Meter System (Simulation)

A full-stack IoT simulation application for smart energy metering with real-time monitoring, digital billing, and theft detection capabilities.

## 📋 Project Overview

This B.E. project simulates a complete smart energy meter ecosystem consisting of:
- **Backend API**: Node.js/Express server that generates realistic time-series energy consumption data
- **Mobile App**: React Native application for end-users to monitor their energy usage
- **Database**: MongoDB for persistent storage of readings, bills, and alerts
- **Simulation Engine**: Automated data generation with anomaly detection

## 🏗️ System Architecture

```
┌─────────────────┐
│  React Native   │
│   Mobile App    │ ◄──── User Interface
└────────┬────────┘
         │ REST API
         │ (HTTP/JSON)
┌────────▼────────┐
│   Node.js API   │
│   (Express.js)  │ ◄──── Business Logic
└────────┬────────┘
         │ Mongoose ODM
┌────────▼────────┐
│    MongoDB      │ ◄──── Data Storage
└─────────────────┘
```

## ✨ Features

### Backend
- ✅ RESTful API with 4 main endpoints
- ✅ Automatic database seeding with 7 days of historical data
- ✅ Live data generation every 5 seconds
- ✅ Theft detection algorithm (1% random chance simulation)
- ✅ Optimized database schemas with compound indexes
- ✅ CORS-enabled for cross-origin requests

### Frontend
- ✅ Real-time power monitoring (auto-updates every 5 seconds)
- ✅ Interactive historical charts (6H, 24H, 7D views)
- ✅ Digital billing system with payment status
- ✅ Alert notifications for anomalies
- ✅ Pull-to-refresh on all screens
- ✅ Modern, clean UI with Material Design principles

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| Mobile App | React Native (Expo) |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Charts | react-native-chart-kit |
| HTTP Client | Axios |
| Navigation | React Navigation |

## 📁 Project Structure

```
ElectoMeter B.E. Project/
│
├── backend/                    # Node.js Backend
│   ├── models/                 # Mongoose schemas
│   │   ├── Meter.js
│   │   ├── Reading.js
│   │   ├── Bill.js
│   │   └── Alert.js
│   ├── routes/                 # API routes
│   │   └── api.js
│   ├── controllers/            # Request handlers
│   │   └── meterController.js
│   ├── services/               # Business logic
│   │   └── simulationService.js
│   ├── server.js               # Main entry point
│   ├── package.json
│   ├── .env                    # Environment config
│   └── README.md
│
└── frontend/                   # React Native App
    ├── screens/                # Main screens
    │   ├── DashboardScreen.js
    │   ├── BillingScreen.js
    │   └── AlertsScreen.js
    ├── components/             # Reusable components
    │   ├── LiveUsageCard.js
    │   ├── UsageHistoryChart.js
    │   └── PeriodSelector.js
    ├── services/               # API integration
    │   └── api.js
    ├── App.js                  # Main app file
    ├── package.json
    └── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**
- **Expo CLI** (optional but recommended)

### Installation

#### 1. Clone or Navigate to Project Directory
```bash
cd "e:\ElectoMeter B.E. Project"
```

#### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smart-meter
NODE_ENV=development
```

#### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

Update API endpoint in `frontend/services/api.js`:
- For development: Use your computer's IP address
- For production: Use your server's IP/domain

### Running the Application

#### Start MongoDB
```bash
# Windows (if installed as service)
net start MongoDB

# Or run manually
mongod
```

#### Start Backend Server
```bash
cd backend
npm start
# Or for development with auto-reload:
npm run dev
```

The backend will:
- Connect to MongoDB
- Seed database with initial data (first run only)
- Start generating live readings every 5 seconds
- Listen on http://localhost:3000

#### Start Mobile App
```bash
cd frontend
npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app for physical device

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Get Live Reading
```http
GET /meters/:meterId/live
```
Returns the most recent energy reading.

**Response:**
```json
{
  "meterId": "MTR-1001",
  "timestamp": "2025-11-02T10:30:00.000Z",
  "power_watts": 450.7,
  "voltage": 230.1,
  "current": 1.96
}
```

#### 2. Get Historical Readings
```http
GET /meters/:meterId/history?period=24h
```
**Parameters:**
- `period`: `6h`, `24h`, or `7d`

**Response:**
```json
[
  {
    "timestamp": "2025-11-02T10:30:00.000Z",
    "power_watts": 450.7,
    "voltage": 230.1,
    "current": 1.96
  }
]
```

#### 3. Get Bills
```http
GET /meters/:meterId/bills
```

**Response:**
```json
[
  {
    "meterId": "MTR-1001",
    "month": 11,
    "year": 2025,
    "total_kwh": 350.5,
    "amount_due": 2804.00,
    "status": "DUE",
    "dueDate": "2025-12-15T00:00:00.000Z"
  }
]
```

#### 4. Get Alerts
```http
GET /meters/:meterId/alerts
```

**Response:**
```json
[
  {
    "meterId": "MTR-1001",
    "timestamp": "2025-11-01T08:45:00.000Z",
    "type": "THEFT_SUSPICION",
    "message": "Sudden power drop detected. Potential meter bypass."
  }
]
```

## 🗃️ Database Schema

### Meter Collection
```javascript
{
  meterId: String (unique),
  ownerName: String,
  address: String,
  createdAt: Date
}
```

### Reading Collection
```javascript
{
  meterId: String,
  timestamp: Date,
  power_watts: Number,
  voltage: Number,
  current: Number
}
```

### Bill Collection
```javascript
{
  meterId: String,
  month: Number (1-12),
  year: Number,
  total_kwh: Number,
  amount_due: Number,
  status: String (DUE/PAID),
  dueDate: Date
}
```

### Alert Collection
```javascript
{
  meterId: String,
  timestamp: Date,
  type: String (THEFT_SUSPICION/HIGH_USAGE),
  message: String
}
```

## 🎯 Simulation Features

### Data Generation
- **Initial Seed**: 7 days of historical readings (1 per 5 minutes)
- **Live Updates**: New reading every 5 seconds
- **Realistic Patterns**: Base power ± random fluctuations
- **Theft Simulation**: 1% chance of power drop to 0

### Theft Detection Algorithm
```javascript
if (power_watts === 0) {
  createAlert({
    type: 'THEFT_SUSPICION',
    message: 'Sudden power drop detected. Potential meter bypass.'
  });
}
```

## 🎨 UI Screenshots

### Dashboard Screen
- Real-time power consumption card
- Historical usage chart
- Period selector (6H/24H/7D)

### Billing Screen
- List of digital bills
- Status indicators (DUE/PAID)
- Energy consumption details

### Alerts Screen
- System notifications
- Alert types with icons
- Timestamp information

## 🔧 Configuration

### Backend Configuration
Edit `backend/.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smart-meter
NODE_ENV=development
```

### Frontend Configuration
Edit `frontend/services/api.js`:
```javascript
// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3000/api';

// For iOS Simulator
const API_BASE_URL = 'http://localhost:3000/api';

// For Physical Device (use your computer's IP)
const API_BASE_URL = 'http://192.168.1.100:3000/api';
```

## 🐛 Troubleshooting

### Backend Issues
1. **MongoDB Connection Error**: Ensure MongoDB is running
2. **Port Already in Use**: Change PORT in `.env` file
3. **Module Not Found**: Run `npm install` again

### Frontend Issues
1. **Cannot Connect to API**: 
   - Check backend is running
   - Verify API_BASE_URL is correct
   - Ensure devices are on same network (for physical device)
2. **Charts Not Displaying**: Check backend is returning data
3. **Expo Error**: Run `expo start -c` to clear cache

## 📊 Testing

### Test Live Updates
1. Start backend server
2. Open dashboard in mobile app
3. Watch power readings update every 5 seconds

### Test Historical Data
1. Navigate to Dashboard
2. Toggle between 6H, 24H, and 7D views
3. Verify chart updates

### Test Alerts
1. Wait for automatic theft simulation (1% chance every 5 seconds)
2. Check Alerts tab for new notifications

## 🚀 Future Enhancements

- [ ] User authentication and authorization
- [ ] Multiple meter support per user
- [ ] Push notifications for critical alerts
- [ ] Export bills as PDF
- [ ] Payment gateway integration
- [ ] Machine learning for consumption prediction
- [ ] Hardware integration with actual IoT meters
- [ ] Real-time WebSocket updates
- [ ] Advanced analytics and reports

## 👥 Contributors

This is a B.E. (Bachelor of Engineering) final year project.

## 📄 License

This project is created for educational purposes.

## 📞 Support

For issues or questions:
1. Check the README files in backend/ and frontend/ directories
2. Review the troubleshooting section
3. Check console logs for detailed error messages

---

**Note**: This is a simulation project. All data is randomly generated for demonstration purposes. In a production environment, this would connect to actual IoT smart meters.
