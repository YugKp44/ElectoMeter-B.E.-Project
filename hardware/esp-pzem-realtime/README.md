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

This firmware sends JSON lines in this format:

{"meterId":"MTR-1001","power_watts":120.53,"voltage":229.84,"current":0.524,"apparent_power_va":120.53,"reactive_power_var":0.00,"power_factor":1.000,"frequency_hz":50.00,"energy_wh":4532.00}

Example:

{"meterId":"MTR-1001","power_watts":118.42,"voltage":230.01,"current":0.515,"apparent_power_va":118.45,"reactive_power_var":1.90,"power_factor":0.999,"frequency_hz":49.98,"energy_wh":4533.07}

No backend code changes are needed.
