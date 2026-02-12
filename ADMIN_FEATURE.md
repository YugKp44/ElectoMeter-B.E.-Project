# Admin Portal Feature - Implementation Guide

## Overview
The Smart Energy Meter system now includes a comprehensive **Admin Portal** that provides system-wide monitoring and management capabilities. Admins can view all meters, manage billing, monitor alerts, and track system statistics in real-time.

---

## Features Implemented

### 🔐 **Dual Login System**
- **User Login**: Access to individual meter dashboard (username: `demo`, password: `demo123`)
- **Admin Login**: Full system access with management capabilities (username: `admin`, password: `admin123`)
- Role-based authentication with color-coded UI (Green for Users, Red for Admin)
- Toggle between User/Admin login modes on the login screen

### 📊 **Admin Dashboard**
- **System Statistics Overview**:
  - Total, Active, and Inactive meters
  - Billing statistics (Total bills, Due, Paid)
  - Revenue tracking (Collected and Pending amounts)
  - Alert metrics (Total, Recent 24h, Theft, High Usage)
  - Energy consumption totals (Last 30 days)
- Auto-refresh every 10 seconds
- Pull-to-refresh functionality
- Color-coded cards for easy visualization

### ⚡ **Meters Management**
- View all registered meters in the system
- Real-time status indicators:
  - 🟢 **Active** (reading within 5 minutes)
  - 🟠 **Warning** (reading within 1 hour)
  - 🔴 **Inactive** (no reading for over 1 hour)
- Display latest readings (Power, Voltage, Current)
- Meter information (Owner, Address, Installation date)
- Last update timestamp for each meter

### 💳 **Billing Management**
- View all bills across all meters
- Filter by status: All, Due, Paid
- Summary cards showing:
  - Total revenue
  - Pending amount
  - Collected amount
- **Bill Status Management**:
  - Mark bills as PAID or DUE
  - Confirmation dialogs for status changes
  - Instant UI updates after changes
- Detailed bill information:
  - Energy consumed (kWh)
  - Amount due (₹)
  - Due date
  - Billing period (Month/Year)

### 🔔 **System Alerts**
- View all alerts across the entire system
- Filter by type:
  - All alerts
  - 🚨 Theft Suspicion alerts
  - 📊 High Usage alerts
- Color-coded alert cards based on severity
- Relative timestamps (e.g., "2h ago", "3d ago")
- Alert details including meter ID and message

---

## Backend Implementation

### **New Model: Admin.js**
```javascript
{
  username: String (unique),
  password: String,
  name: String,
  email: String (unique),
  role: 'admin' | 'super_admin',
  permissions: {
    viewAllMeters: Boolean,
    viewAllBills: Boolean,
    viewAllAlerts: Boolean,
    updateBills: Boolean,
    manageMeters: Boolean
  },
  lastLogin: Date
}
```

### **Admin API Endpoints**

#### Authentication
- `POST /api/admin/login` - Admin login with credentials

#### Dashboard & Statistics
- `GET /api/admin/stats` - Get system-wide statistics

#### Meters
- `GET /api/admin/meters` - Get all meters with latest readings
- `GET /api/admin/meters/:meterId` - Get detailed meter information

#### Billing
- `GET /api/admin/bills?status=[DUE|PAID]` - Get all bills (optional filter)
- `PUT /api/admin/bills/:billId` - Update bill status

#### Alerts
- `GET /api/admin/alerts?type=[THEFT_SUSPICION|HIGH_USAGE]` - Get all alerts (optional filter)

### **Admin Controller Functions**
- `login()` - Authenticate admin users
- `getSystemStats()` - Calculate and return system metrics
- `getAllMeters()` - Fetch all meters with latest readings
- `getMeterDetails()` - Get comprehensive meter information
- `getAllBills()` - Fetch bills with optional filtering
- `updateBillStatus()` - Change bill payment status
- `getAllAlerts()` - Fetch alerts with optional filtering
- `createDefaultAdmin()` - Initialize default admin account on startup

---

## Frontend Implementation

### **New Admin Screens**

#### 1. **AdminDashboardScreen.js**
- System overview with real-time statistics
- Four main sections: Meters, Billing, Revenue, Alerts, Energy
- Auto-refresh every 10 seconds
- Pull-to-refresh support
- Color-coded stat cards

#### 2. **AdminMetersScreen.js**
- List of all meters with status indicators
- Latest reading display for each meter
- Status badges (Active/Warning/Inactive)
- Meter details (Owner, Address, Installation date)
- Pull-to-refresh functionality

#### 3. **AdminBillingScreen.js**
- Comprehensive bill management interface
- Summary cards for Total, Due, and Paid amounts
- Filter options (All, Due, Paid)
- Bill status update functionality
- Confirmation dialogs before changes
- Detailed bill information display

#### 4. **AdminAlertsScreen.js**
- All system alerts in one view
- Filter by type (All, Theft, High Usage)
- Color-coded alerts by severity
- Relative timestamps
- Alert icons for quick identification

### **Updated Components**

#### **LoginScreen.js**
- Added role selector toggle (User/Admin)
- Dynamic theme colors based on role
- Updated credentials display
- API integration for admin login

#### **App.js**
- Conditional navigation based on user role
- Separate tab navigators for User and Admin
- Logout functionality with role reset
- Theme colors match role (Green for User, Red for Admin)

#### **services/api.js**
- Added all admin API endpoints
- Error handling for all requests
- Consistent response structure

---

## Default Credentials

### User Account
- **Username**: `demo`
- **Password**: `demo123`
- **Access**: Single meter dashboard (MTR-1001)

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full system with all meters, bills, and alerts
- **Permissions**: All management capabilities enabled

> ⚠️ **Security Note**: In production, passwords should be hashed using bcrypt or similar before storing in the database.

---

## Setup Instructions

### Backend Setup
1. The admin model is automatically loaded when the server starts
2. Default admin account is created on first run
3. No additional configuration needed

### Frontend Setup
1. All admin screens are automatically available
2. No additional dependencies required
3. API base URL should be configured in `services/api.js`

---

## Admin Portal Navigation

### Admin Tabs (Bottom Navigation):
1. **📊 Overview** - System dashboard with statistics
2. **⚡ Meters** - All meters management
3. **💳 Billing** - Bill management and tracking
4. **🔔 Alerts** - System-wide alerts monitoring

### User Tabs (Bottom Navigation):
1. **📊 Dashboard** - Individual meter dashboard
2. **💳 Billing** - User's bills
3. **🔔 Alerts** - User's meter alerts

---

## Key Features & Benefits

### For Administrators:
✅ **Complete System Oversight** - Monitor all meters from one dashboard
✅ **Real-time Statistics** - Live data updates every 10 seconds
✅ **Billing Management** - Update payment status instantly
✅ **Alert Monitoring** - Track all system alerts with filtering
✅ **Status Tracking** - Know which meters are active/inactive
✅ **Revenue Tracking** - Monitor collected and pending amounts

### For Development:
✅ **RESTful API Design** - Clean and consistent endpoints
✅ **Role-based Access** - Separate user and admin portals
✅ **Responsive UI** - Works on all screen sizes
✅ **Real-time Updates** - Auto-refresh and pull-to-refresh
✅ **Error Handling** - Graceful error messages
✅ **Extensible Architecture** - Easy to add new admin features

---

## Future Enhancements (Potential)

- [ ] User management (add/edit/delete users)
- [ ] Meter installation workflow
- [ ] Advanced analytics and reporting
- [ ] Export data (CSV, PDF)
- [ ] Push notifications for critical alerts
- [ ] Role-based permissions (read-only admins, etc.)
- [ ] Audit logs for admin actions
- [ ] Dark mode support
- [ ] Multi-language support

---

## Testing the Admin Portal

### Step 1: Start Backend
```bash
cd backend
npm start
```

### Step 2: Start Frontend
```bash
cd frontend
npm start
```

### Step 3: Login as Admin
1. Open the app
2. Toggle to "Admin Login"
3. Use credentials: `admin` / `admin123`
4. Navigate through all admin tabs

### Step 4: Test Features
- ✅ View system statistics
- ✅ Check all meters
- ✅ Filter and update bills
- ✅ Monitor and filter alerts
- ✅ Pull to refresh on each screen
- ✅ Logout and switch to user mode

---

## API Response Examples

### Get System Stats
```json
{
  "meters": { "total": 3, "active": 2, "inactive": 1 },
  "bills": { "total": 21, "due": 3, "paid": 18 },
  "alerts": { "total": 15, "recent24h": 2, "theftSuspicion": 5, "highUsage": 10 },
  "revenue": { "total": 12450.50, "pending": 1250.00, "collected": 11200.50 },
  "energy": { "totalKwh": 1542.75 }
}
```

### Get All Meters
```json
[
  {
    "meterId": "MTR-1001",
    "ownerName": "Rajesh Kumar",
    "address": "123 MG Road, Bangalore",
    "createdAt": "2024-11-01T00:00:00.000Z",
    "latestReading": {
      "power_watts": 450.5,
      "voltage": 230.1,
      "current": 1.96,
      "timestamp": "2024-11-13T10:30:00.000Z"
    }
  }
]
```

---

## Color Scheme

### Admin Portal
- Primary: `#FF6B6B` (Red)
- Success: `#4CAF50` (Green)
- Warning: `#FF9800` (Orange)
- Danger: `#F44336` (Deep Red)
- Info: `#2196F3` (Blue)

### User Portal
- Primary: `#4CAF50` (Green)
- Secondary: `#45a049` (Dark Green)

---

## Conclusion

The Admin Portal provides a comprehensive management interface for the Smart Energy Meter system. With real-time monitoring, bill management, and alert tracking, administrators have complete control over the entire system from a single, intuitive interface.

**Admin Login**: `admin` / `admin123`

Enjoy exploring the full power of your Smart Energy Meter system! 🚀
