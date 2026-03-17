# Hardware Setup from Scratch (ESP32 + PZEM-004T)

This guide gives you a **small final-year demo setup** for your ElectoMeter app using real hardware data.

---

## 1) What you need to buy (updated to your case)

You said you will **not buy MCB** and you **do not have a multimeter**.

### Required
- 1 × ESP32 DevKit (ESP32-WROOM-32)
- 1 × PZEM-004T v3.0 module
- 1 × CT sensor (usually included with PZEM)
- 1 × 5V 2A adapter (good quality)
- 1 × USB cable for ESP32 programming
- Jumper wires (male-female)
- Small breadboard or terminal block board
- 1 × AC bulb holder + 40W or 60W bulb (demo load)
- 1 × Insulated enclosure / plastic project box

### Optional (recommended)
- Extra ESP32 (backup)
- Extra jumper wires

---

## 2) Important safety notes (read first)

- Work only with power **OFF** while wiring.
- Keep AC mains wiring physically separate from ESP32 low-voltage wires.
- Do not touch exposed AC terminals.
- Use insulated connectors and close everything inside enclosure before powering.
- Since you are skipping MCB for the prototype, use a **low-power load only** (40W/60W bulb) and power from a socket line that already has home/building breaker protection.

If you are unsure in AC wiring, take help from an electrician for the final AC connection.

---

## 3) Exact pin connections

## 3.1 PZEM <-> ESP32 (low-voltage side)

- PZEM `TX` -> ESP32 `GPIO16` (RX2)
- PZEM `RX` -> ESP32 `GPIO17` (TX2)
- PZEM `GND` -> ESP32 `GND`
- PZEM `5V` -> ESP32 `5V`

> Use common ground between ESP32 and PZEM.

## 3.2 AC and CT side (measurement side)

- AC `Live (L)` input -> PZEM `L` input terminal
- AC `Neutral (N)` input -> PZEM `N` input terminal
- Output side from PZEM goes to your load line (bulb holder)
- CT clamp goes around **Live wire only** (not neutral)

For split/open CT:
- Clamp CT around only one conductor (Live), never both Live+Neutral together.

---

## 4) Firmware flow (what ESP32 does)

1. Connect to Wi-Fi
2. Read from PZEM every 2–5 seconds:
   - voltage
   - current
   - power
   - energy
   - frequency
   - power factor
3. Send JSON to your backend endpoint:
   - `POST /api/readings/create`

Example payload:

```json
{
  "meterId": "MTR-1001",
  "voltage": 229.8,
  "current": 0.26,
  "power_watts": 59.7,
  "energy_kwh": 1.42,
  "frequency": 50.0,
  "power_factor": 0.98
}
```

---

## 5) Backend alignment with your software

Your frontend already reads from existing APIs, so frontend changes are minimal.

## Required backend behavior
- Accept hardware data through `POST /api/readings/create`
- Save at least these fields in `Reading`:
  - `meterId`
  - `timestamp`
  - `voltage`
  - `current`
  - `power_watts`
- Optional fields:
  - `energy_kwh`, `frequency`, `power_factor`

## Important
- Disable mock live generation during hardware demo, otherwise mock + real data will mix.

---

## 6) Step-by-step setup sequence

1. Assemble ESP32 ↔ PZEM low-voltage UART wiring.
2. Flash ESP32 code with your Wi-Fi and backend IP.
3. Start backend server and MongoDB.
4. Connect AC input/load/CT with power OFF.
5. Put hardware in enclosure.
6. Power ON.
7. Open serial monitor and confirm stable readings.
8. Check backend receives data (`201` responses).
9. Open mobile app and verify dashboard values change when bulb ON/OFF.

---

## 7) Testing without multimeter

Since you do not have a multimeter, validate using behavior checks:

- With bulb OFF:
  - current near 0 A
  - power near 0 W
- With 40W bulb ON:
  - power around ~35–50W (approx)
- With 60W bulb ON:
  - power around ~50–75W (approx)
- Voltage should stay around your mains nominal range.

Quick estimate:
- Expected current is approximately `I = P / V`
- Example for 60W at 230V: `I ≈ 0.26A`

This is enough for demo validation.

---

## 8) Presentation-ready demo script (1 minute)

1. Show app dashboard with near-zero load.
2. Switch bulb ON.
3. After a few seconds show increased `power_watts` and `current`.
4. Show history chart update.
5. Explain this is real-time hardware ingestion from ESP32 + PZEM into Node/Mongo backend.

---

## 9) Common mistakes to avoid

- RX/TX not crossed correctly
- CT placed on neutral instead of live
- CT clamped around both live and neutral
- Wrong Wi-Fi credentials
- Backend URL points to localhost instead of laptop LAN IP
- Keeping simulation service ON during hardware run

---

## 10) Final recommendation for your exact case

Your minimal and practical demo build is:

- ESP32 + PZEM-004T + CT
- One bulb load
- Real-time POST to backend
- Existing app screens unchanged

This is fully valid for a final-year project demo and strongly aligned with your current software architecture.
