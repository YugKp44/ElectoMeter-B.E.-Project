# Partner Handover - Local Fallback Checklist

Use this only when cloud backend is unavailable.

## Minimum Requirements on Partner Laptop

1. Node.js LTS installed
2. MongoDB installed and running
3. Git or project ZIP extracted
4. Same Wi-Fi network for phone testing

## One-Time Setup

From project root run:

```powershell
.\install.ps1
```

This installs backend and frontend dependencies.

## Backend Setup

Check file [backend/.env](backend/.env):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smart-meter
NODE_ENV=development
ENABLE_SIMULATION=true
SEED_DATABASE=true
ESP_SERIAL_ENABLED=false
ESP_DEFAULT_METER_ID=MTR-1001
```

Start backend:

```powershell
cd backend
npm start
```

Important:

1. Keep terminal open.
2. If port is busy, stop old process using port 3000.

## Frontend Setup

Find partner laptop IPv4 (Wi-Fi):

```powershell
ipconfig
```

Set [frontend/.env](frontend/.env):

```env
EXPO_PUBLIC_API_BASE_URL=http://<PARTNER_LAPTOP_IP>:3000/api
```

Start frontend:

```powershell
cd frontend
npm start
```

## Physical Device Access (Android)

1. Phone and laptop must be on same Wi-Fi.
2. Allow port 3000 in Windows firewall (Admin PowerShell):

```powershell
Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private
New-NetFirewallRule -DisplayName "ElectoMeter Backend 3000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000 -Profile Private,Public
```

3. Test on phone browser:

```text
http://<PARTNER_LAPTOP_IP>:3000/api/esp/status
```

If browser fails, app will fail too.

## Local ESP Hardware Mode (Optional)

Only if partner has ESP hardware connected by USB:

1. Set [backend/.env](backend/.env):

```env
ENABLE_SIMULATION=false
SEED_DATABASE=false
ESP_SERIAL_ENABLED=true
ESP_SERIAL_PORT=COM7
ESP_SERIAL_BAUD_RATE=9600
ESP_DEFAULT_METER_ID=MTR-1001
```

2. Ensure COM port is not busy (close Arduino Serial Monitor).
3. Restart backend.

## Known Fast Fixes

1. Error EADDRINUSE on backend start:
   - Port 3000 already used. Stop old process.
2. Axios Network Error on app:
   - Wrong IP in [frontend/.env](frontend/.env) or firewall block.
3. COM7 access denied:
   - Close backend or serial monitor before uploading firmware.
