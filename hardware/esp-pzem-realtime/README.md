# ESP32 PZEM Real-Time Firmware

Use this firmware when PZEM-004T sensor is available.

## File

- Sketch: [esp-pzem-realtime.ino](esp-pzem-realtime.ino)

## Wiring

- PZEM TX to ESP32 GPIO16 (RX2)
- PZEM RX to ESP32 GPIO17 (TX2)
- PZEM GND to ESP32 GND
- PZEM 5V to ESP32 5V

## Install Arduino Library

Install library MycilaPZEM (mathieucarbou) in Arduino IDE.

## Upload Flow

1. Stop backend first if running.
2. Open [esp-pzem-realtime.ino](esp-pzem-realtime.ino).
3. Select board ESP32 Dev Module.
4. Select COM port used by ESP.
5. Upload.
6. Keep Serial Monitor closed after upload.
7. Start backend from [backend](../../backend) with npm start.

## Backend Compatibility

This firmware sends CSV lines in this format:

power_watts,voltage,current,meterId

Example:

120.53,229.84,0.524,MTR-1001

No backend code changes are needed.
