# ESP No-Sensor Demo Mode

Use this when you only have ESP board + USB cable and no current/voltage sensor.

This sketch cycles through 4 modes every 20 seconds and sends data to backend via USB serial:

- IDLE: very low consumption
- NORMAL: normal home load
- HIGH: high load
- THEFT: zero power (helps demo theft alert)

## Files

- Sketch: [esp-no-sensor-demo.ino](esp-no-sensor-demo.ino)

## Steps

1. Open [esp-no-sensor-demo.ino](esp-no-sensor-demo.ino) in Arduino IDE.
2. Select your board and COM port (your machine detected CP210x at COM7).
3. If backend is running, stop it first (it keeps COM7 busy).
4. Upload sketch.
5. Close Serial Monitor after upload.
6. Run backend in [backend](../../backend):
   - npm start

7. Test API:
   - GET [http://localhost:3000/api/esp/status](http://localhost:3000/api/esp/status)
   - GET [http://localhost:3000/api/meters/MTR-1001/live](http://localhost:3000/api/meters/MTR-1001/live)

## Important backend values

Check these in [backend/.env](../../backend/.env):

- ESP_SERIAL_ENABLED=true
- ESP_SERIAL_PORT=COM7
- ESP_SERIAL_BAUD_RATE=9600
- ENABLE_SIMULATION=false

## If phone app cannot connect

Set frontend API base URL to your laptop Wi-Fi IP:

- [http://172.21.45.161:3000/api](http://172.21.45.161:3000/api)
