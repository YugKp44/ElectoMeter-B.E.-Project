# Quick Setup Guide

Follow these steps to get your Smart Energy Meter System running quickly.

## ⚡ Quick Start (5 Minutes)

### Step 1: Install MongoDB (if not installed)

**Windows:**
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB should start automatically as a service

**Mac (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Step 2: Setup Backend

Open PowerShell and run:

```powershell
cd "e:\ElectoMeter B.E. Project\backend"
npm install
```

Wait for installation to complete, then start the server:

```powershell
npm start
```

You should see:
```
✓ Connected to MongoDB
Seeding database with initial data...
✓ Meter created
✓ 2016 historical readings created
✓ 4 sample bills created
✓ 2 sample alerts created
Database seeding completed successfully!
Starting live data generation (every 5 seconds)...
✓ Server running on port 3000
✓ API available at http://localhost:3000/api
```

**Leave this terminal open!**

### Step 3: Setup Frontend

Open a **NEW** PowerShell window:

```powershell
cd "e:\ElectoMeter B.E. Project\frontend"
npm install
```

This will take a few minutes. Once complete, start the app:

```powershell
npm start
```

Expo DevTools will open in your browser.

### Step 4: Run the App

**Option A: Android Emulator**
- Press `a` in the terminal
- Or click "Run on Android device/emulator" in Expo DevTools

**Option B: iOS Simulator (Mac only)**
- Press `i` in the terminal
- Or click "Run on iOS simulator" in Expo DevTools

**Option C: Physical Device**
1. Install "Expo Go" app from Play Store/App Store
2. Scan the QR code shown in terminal/Expo DevTools
3. **Important**: Update API URL first!

### Step 5: Configure API for Physical Device (if needed)

If using a physical device:

1. Find your computer's IP address:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (usually starts with 192.168.x.x)

2. Edit `frontend\services\api.js`:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP_HERE:3000/api';
   // Example: 'http://192.168.1.100:3000/api'
   ```

3. Restart the Expo server

## ✅ Verification

Once the app is running:

1. **Dashboard Tab**: You should see live power readings updating every 5 seconds
2. **Billing Tab**: You should see 4 sample bills
3. **Alerts Tab**: You should see 2 sample alerts

## 🎯 Default Test Meter

The simulation creates one meter by default:
- **Meter ID**: MTR-1001
- **Owner**: John Doe
- **Address**: 123 Main Street, Mumbai, Maharashtra - 400001

## 🔧 Common Issues

### "Cannot connect to API"
**Solution**: Make sure backend is running. Check terminal for errors.

### "Module not found" errors
**Solution**: 
```powershell
cd backend
rm -r node_modules
npm install

cd ../frontend
rm -r node_modules
npm install
```

### MongoDB connection failed
**Solution**: 
```powershell
# Check if MongoDB is running
net start MongoDB

# Or start it manually
mongod
```

### Expo won't start
**Solution**:
```powershell
npm install -g expo-cli
expo start -c  # -c clears cache
```

### Port 3000 already in use
**Solution**: Edit `backend\.env` and change:
```
PORT=3001
```
Then update `frontend\services\api.js` to use port 3001.

## 📱 Testing Features

### Test Live Updates
1. Keep Dashboard screen open
2. Watch the power value change every 5 seconds
3. Note the timestamp updating

### Test Historical Charts
1. On Dashboard, tap different period buttons (6H, 24H, 7D)
2. Chart should update with different data ranges

### Test Theft Detection
1. Keep the app open on any screen
2. Backend generates random theft events (1% chance every 5 seconds)
3. When it happens, check Alerts tab for new "THEFT_SUSPICION" alert
4. You'll also see "⚠ Theft alert generated!" in backend terminal

### Test Pull-to-Refresh
1. Pull down on any screen
2. Data should refresh

## 📊 Database Inspection (Optional)

To view the database directly:

```powershell
# Install MongoDB Compass (GUI)
# Download from https://www.mongodb.com/products/compass

# Or use MongoDB Shell
mongosh
use smart-meter
db.meters.find()
db.readings.find().limit(5)
db.bills.find()
db.alerts.find()
```

## 🎓 Project Demo Tips

For project presentations:

1. **Open Multiple Terminals**:
   - Terminal 1: Backend server showing live data generation
   - Terminal 2: Frontend Expo server
   - Terminal 3: MongoDB (optional)

2. **Show Live Updates**:
   - Open Dashboard and let it run
   - Point out the auto-updating power readings
   - Show the console logs in backend terminal

3. **Demonstrate Features**:
   - Toggle between different time periods on chart
   - Show billing status indicators
   - Wait for a theft alert (or manually trigger by waiting)

4. **Explain Architecture**:
   - Show the API endpoints in browser: http://localhost:3000/api/meters/MTR-1001/live
   - Explain the 3-tier architecture
   - Discuss the simulation algorithm

## 🚀 Next Steps

Once everything is working:

1. Read the main README.md for detailed documentation
2. Explore the code structure
3. Customize the simulation parameters
4. Add additional features
5. Prepare project documentation

## 📞 Need Help?

Check the main README.md file for:
- Complete API documentation
- Detailed architecture explanation
- Database schema details
- Full feature list
- Troubleshooting guide

---

**Estimated Setup Time**: 5-10 minutes (excluding downloads)

**Prerequisites**: Node.js installed, basic command line knowledge

**Tested On**: Windows 10/11, macOS, Ubuntu Linux
