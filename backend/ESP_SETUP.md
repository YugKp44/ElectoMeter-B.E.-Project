# ESP to Backend Setup (USB Serial)

This guide helps you send live ESP readings (via USB cable to laptop) into this backend so the mobile app can show real data.

No sensor yet? Use ready sketch at `../hardware/esp-no-sensor-demo/esp-no-sensor-demo.ino`.
Real PZEM sensor mode sketch is at `../hardware/esp-pzem-realtime/esp-pzem-realtime.ino`.

## 1. Configure backend `.env`

In `backend/.env`, use:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smart-meter
NODE_ENV=development

# Turn off generated fake readings while testing real ESP data
ENABLE_SIMULATION=false

# Optional: skip huge seed if you only want hardware data
SEED_DATABASE=false

# USB serial ingestion settings
ESP_SERIAL_ENABLED=true
ESP_SERIAL_PORT=COM3
ESP_SERIAL_BAUD_RATE=9600
ESP_DEFAULT_METER_ID=MTR-1001

# Optional security for POST /api/esp/readings
# ESP_API_KEY=your-secret-key
```

Change `ESP_SERIAL_PORT` to your actual port (COM3, COM4, etc.).

## 2. Install dependencies

Run inside `backend/`:

```bash
npm install
```

## 3. Start backend

```bash
npm run dev
```

You should see serial connection logs if ESP is connected and the port is correct.

## 4. ESP serial output format

Send one line per reading. Supported formats:

### JSON format

```text
{"meterId":"MTR-1001","power_watts":120.5,"voltage":229.7,"current":0.525}
```

### key=value format

```text
meterId=MTR-1001,power=120.5,voltage=229.7,current=0.525
```

### CSV format

```text
120.5,229.7,0.525,MTR-1001
```

If meter id is missing, backend uses `ESP_DEFAULT_METER_ID`.

## 5. Quick Arduino example

```cpp
void setup() {
  Serial.begin(9600);
}

void loop() {
  float voltage = 230.0;
  float current = 0.55;
  float power = voltage * current;

  // CSV: power,voltage,current,meterId
  Serial.print(power, 2);
  Serial.print(",");
  Serial.print(voltage, 2);
  Serial.print(",");
  Serial.print(current, 3);
  Serial.print(",MTR-1001\n");

  delay(2000);
}
```

Important: close Arduino Serial Monitor before running backend serial ingestion (only one process can use the COM port).

## 6. Verify data from backend

```bash
curl http://localhost:3000/api/meters/MTR-1001/live
```

Or in PowerShell:

```powershell
Invoke-RestMethod http://localhost:3000/api/meters/MTR-1001/live
```

## 7. Point mobile app to your laptop backend

Set frontend env variable before running Expo:

```env
EXPO_PUBLIC_API_BASE_URL=http://<LAPTOP_IP>:3000/api
```

Notes:

- Real phone on same Wi-Fi: use laptop local IP (for example `192.168.1.10`).
- Android emulator: use `http://10.0.2.2:3000/api`.
- iOS simulator: `http://localhost:3000/api` usually works.

## 8. Optional direct ESP HTTP API (Wi-Fi boards)

You can also POST reading data directly:

```http
POST /api/esp/readings
Content-Type: application/json
```

Body:

```json
{
  "meterId": "MTR-1001",
  "power_watts": 120.5,
  "voltage": 229.7,
  "current": 0.525
}
```

Status endpoint:

```http
GET /api/esp/status
```
