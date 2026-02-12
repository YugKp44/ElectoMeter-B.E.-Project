# 🎯 Admin Feature - Quick Start Guide

## Login Credentials

### 👤 User Login (Regular Meter Owner)
- **Username**: `demo`
- **Password**: `demo123`
- **Access**: View single meter (MTR-1001) data

### 👨‍💼 Admin Login (System Administrator)
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full system control - all meters, bills, alerts

---

## Admin Portal Features

### 📊 Dashboard Tab
- **System Statistics** at a glance
- **Meter Status**: Active, Inactive counts
- **Bills**: Total, Due, Paid
- **Revenue**: Collected and Pending
- **Alerts**: Total, Recent, by Type
- **Energy Consumption**: Last 30 days total
- **Auto-refreshes** every 10 seconds

### ⚡ Meters Tab
- **All registered meters** in the system
- **Status indicators**:
  - 🟢 Green = Active (last 5 min)
  - 🟠 Orange = Warning (last hour)
  - 🔴 Red = Inactive (>1 hour)
- **Real-time readings**: Power, Voltage, Current
- Owner name, Address, Installation date
- Pull to refresh anytime

### 💳 Billing Tab
- **All bills** from all meters
- **Summary cards**: Total, Due, Paid amounts
- **Filter options**: All / Due / Paid
- **Change bill status**: Click "Mark as PAID/DUE" button
- Confirmation dialog before changes
- Energy consumed, Amount, Due date for each bill

### 🔔 Alerts Tab
- **All system alerts** in one place
- **Filter by type**:
  - All Alerts
  - 🚨 Theft Suspicion (Red)
  - 📊 High Usage (Orange)
- Timestamp and meter ID for each alert
- Pull to refresh

---

## Key Differences: User vs Admin

| Feature | User Portal | Admin Portal |
|---------|------------|--------------|
| **Color Theme** | 🟢 Green | 🔴 Red |
| **Meters** | Single meter (MTR-1001) | All meters |
| **Bills** | Own bills only | All bills + status control |
| **Alerts** | Own alerts only | All system alerts |
| **Dashboard** | Single meter stats | System-wide statistics |
| **Management** | View only | Update bill status |

---

## Quick Actions

### ✅ Mark a Bill as Paid (Admin)
1. Login as admin
2. Go to **Billing** tab
3. Find the bill
4. Tap **"Mark as PAID"** button
5. Confirm in dialog
6. ✅ Done! Status updated

### 🔍 Filter Alerts (Admin)
1. Go to **Alerts** tab
2. Tap filter buttons at top:
   - **All** - Show everything
   - **🚨 Theft** - Theft suspicion only
   - **📊 High Usage** - High usage only

### 📊 Check System Health (Admin)
1. Go to **Dashboard** tab
2. Look at **Meters** section:
   - Active = Good ✅
   - Inactive = Check issues ⚠️
3. Check **Revenue**:
   - Monitor pending amounts

---

## Navigation

### Bottom Tabs - Admin Portal
```
📊 Overview | ⚡ Meters | 💳 Billing | 🔔 Alerts
```

### Bottom Tabs - User Portal
```
📊 Dashboard | 💳 Billing | 🔔 Alerts
```

### Top Bar
- **App Name** on left
- **Logout** button on right (both portals)

---

## Auto-Refresh

| Screen | Refresh Rate |
|--------|--------------|
| Admin Dashboard | Every 10 seconds |
| All other screens | Pull-to-refresh only |

---

## Status Colors

### Meters
- 🟢 **Green**: Active (recent data)
- 🟠 **Orange**: Warning (stale data)
- 🔴 **Red**: Inactive (no recent data)

### Bills
- 🟢 **Green**: PAID
- 🔴 **Red**: DUE

### Alerts
- 🔴 **Red**: Theft Suspicion
- 🟠 **Orange**: High Usage

---

## Troubleshooting

### Can't login as admin?
- Check username: `admin` (all lowercase)
- Check password: `admin123`
- Make sure backend server is running
- Toggle to "Admin Login" on login screen

### No data showing?
- Pull down to refresh
- Check backend server is running
- Verify API URL in `frontend/services/api.js`

### Bill status not updating?
- Check network connection
- Confirm in the dialog
- Pull to refresh after update

---

## API Endpoints (for reference)

```
POST   /api/admin/login
GET    /api/admin/stats
GET    /api/admin/meters
GET    /api/admin/meters/:meterId
GET    /api/admin/bills?status=DUE
PUT    /api/admin/bills/:billId
GET    /api/admin/alerts?type=THEFT_SUSPICION
```

---

## Running the App

### Start Backend
```bash
cd backend
npm start
```

### Start Frontend
```bash
cd frontend
npm start
```

Then scan QR code or press:
- `a` for Android
- `i` for iOS

---

## Tips & Best Practices

✅ **Logout** when switching between user/admin  
✅ **Pull to refresh** for latest data  
✅ **Use filters** to find specific bills/alerts  
✅ **Monitor dashboard** regularly for system health  
✅ **Confirm** before changing bill status  

---

**Need more details?** See `ADMIN_FEATURE.md` for complete documentation.

**Happy Monitoring! 🎉**
