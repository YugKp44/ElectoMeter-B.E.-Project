# 🔧 Troubleshooting Guide - Admin Login Network Error

## Problem
Getting "Network Error" when trying to admin login.

## Root Cause
The frontend is trying to connect to an incorrect API URL (old IP address or wrong configuration).

---

## Quick Fix

### Option 1: Run the Configuration Script (Easiest)
```powershell
# From project root directory
.\configure-api.ps1
```
Then follow the prompts to select your device type.

### Option 2: Manual Configuration

#### For Web Browser / iOS Simulator
Edit `frontend/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

#### For Android Emulator
Edit `frontend/services/api.js`:
```javascript
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

#### For Physical Device
1. Get your computer's IP address:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. Edit `frontend/services/api.js`:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3000/api';
   ```

3. Make sure your phone and computer are on the **same WiFi network**

---

## Verification Steps

### 1. Check Backend is Running
```powershell
# Test backend
curl http://localhost:3000/

# Should return:
# {
#   "message": "Smart Energy Meter API",
#   "version": "1.0.0",
#   "status": "running"
# }
```

### 2. Test Admin Login Endpoint
```powershell
$body = @{username='admin'; password='admin123'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/login' -Method Post -Body $body -ContentType 'application/json'

# Should return admin data with success: true
```

### 3. Restart Frontend
After changing the API URL:
```bash
# Stop the current Expo server (Ctrl+C)
# Clear cache and restart
npm start -- --clear
```

---

## Common Issues

### Issue: Backend not running
**Solution:**
```powershell
cd backend
npm start
```

### Issue: Port 3000 already in use
**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=3001
```

### Issue: Firewall blocking connection
**Solution:**
- Allow Node.js through Windows Firewall
- Or temporarily disable firewall for testing

### Issue: IP address changed
**Solution:**
- Run `configure-api.ps1` script again
- Or manually update the IP in `frontend/services/api.js`

---

## Current Configuration

### Backend
- **URL**: `http://localhost:3000`
- **API Base**: `http://localhost:3000/api`

### Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

### User Credentials
- **Username**: `demo`
- **Password**: `demo123`

---

## Testing Admin Login

### From Command Line
```powershell
# Test login endpoint
$body = @{username='admin'; password='admin123'} | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/login' -Method Post -Body $body -ContentType 'application/json'
$response | ConvertTo-Json
```

### From Frontend
1. Make sure backend is running
2. Update API URL in `frontend/services/api.js`
3. Restart Expo (clear cache)
4. Open app
5. Toggle to "Admin Login"
6. Enter: `admin` / `admin123`
7. Click "Login"

---

## Still Having Issues?

### Check Console Logs
1. Open browser developer tools (F12)
2. Look for error messages in Console
3. Check Network tab for failed requests

### Enable Debug Mode
In `frontend/services/api.js`, add logging:
```javascript
api.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.log('Error:', error);
    return Promise.reject(error);
  }
);
```

### Verify Network
```powershell
# Ping your IP (if using physical device)
ping 10.33.180.161

# Check port is accessible
Test-NetConnection -ComputerName localhost -Port 3000
```

---

## Quick Checklist

✅ Backend server is running (`cd backend && npm start`)  
✅ Port 3000 is accessible  
✅ API URL is correctly configured in `frontend/services/api.js`  
✅ Frontend has been restarted after config change  
✅ Using correct credentials (`admin` / `admin123`)  
✅ Toggled to "Admin Login" (not User Login)  
✅ Phone and computer on same WiFi (if using physical device)  

---

## Need Help?

If you're still stuck:
1. Check backend logs for errors
2. Check frontend console for detailed error messages
3. Verify MongoDB is running
4. Try user login first to verify basic connectivity
