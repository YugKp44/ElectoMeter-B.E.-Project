# ESP USB Simple Sender

This sketch sends simulated power data from ESP to backend using USB serial.

## Data Format Sent

power_watts,voltage,current,meterId

Example line:

123.40,229.10,0.539,MTR-1001

## Use It

1. Open [esp-usb-simple.ino](esp-usb-simple.ino) in Arduino IDE.
2. Select your board and COM port (for your setup this is COM7).
3. Upload the sketch.
4. Close Arduino Serial Monitor after upload.
5. Start backend from [backend](../../backend) with npm start.
6. Check status API:
   - GET http://localhost:3000/api/esp/status
7. Check live reading API:
   - GET http://localhost:3000/api/meters/MTR-1001/live

## Tune Values

In the sketch, change these values:
- METER_ID
- SEND_INTERVAL_MS
- BASE_VOLTAGE
- BASE_CURRENT
- CURRENT_VARIATION

## Baud Rate

Default baud rate is 9600. If you change it in sketch, also change ESP_SERIAL_BAUD_RATE in [backend/.env](../../backend/.env).
