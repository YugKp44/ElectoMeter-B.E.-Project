#include <math.h>
#include <MycilaPZEM.h>

const unsigned long USB_BAUD_RATE = 9600;
const unsigned long SEND_INTERVAL_MS = 1000;
const unsigned long HEARTBEAT_INTERVAL_MS = 2000;
const bool USB_DEBUG_ENABLED = false;
const float ZERO_CURRENT_THRESHOLD_A = 0.02f;
const float ZERO_POWER_THRESHOLD_W = 3.0f;

const char *METER_ID = "MTR-1001";
const int PZEM_RX_PIN = 16;
const int PZEM_TX_PIN = 17;

Mycila::PZEM pzem;

unsigned long lastSendAt = 0;
unsigned long lastHeartbeatAt = 0;

bool isValidValue(float value)
{
    return !isnan(value) && isfinite(value) && value >= 0.0f;
}

void debugLine(const char *message)
{
    if (USB_DEBUG_ENABLED)
    {
        Serial.println(message);
    }
}

void setup()
{
    Serial.begin(USB_BAUD_RATE);
    delay(1200);

    debugLine("PZEM firmware started");
    debugLine("Using MycilaPZEM sync read mode");

    // Start on Serial2 using explicit RX/TX pins.
    pzem.begin(Serial2, PZEM_RX_PIN, PZEM_TX_PIN, MYCILA_PZEM_ADDRESS_GENERAL, false);

    pzem.setCallback([](const Mycila::PZEM::EventType eventType, const Mycila::PZEM::Data &data)
                     {
        if (eventType != Mycila::PZEM::EventType::EVT_READ)
        {
            return;
        }

        float voltage = data.voltage;
        float current = data.current;
        float power = data.activePower;

        if (!isValidValue(voltage) || !isValidValue(current))
        {
            if (USB_DEBUG_ENABLED)
            {
                Serial.print("PZEM invalid read V ");
                Serial.print(voltage);
                Serial.print(" I ");
                Serial.println(current);
            }
            return;
        }

        if (!isValidValue(power))
        {
            power = voltage * current;
        }

        // Clamp only tiny idle readings to zero. Both current and power must be low.
        if (current <= ZERO_CURRENT_THRESHOLD_A && power <= ZERO_POWER_THRESHOLD_W)
        {
            current = 0.0f;
            power = 0.0f;
        }

        // CSV format expected by backend serial parser: power,voltage,current,meterId
        Serial.print(power, 2);
        Serial.print(",");
        Serial.print(voltage, 2);
        Serial.print(",");
        Serial.print(current, 3);
        Serial.print(",");
        Serial.println(METER_ID); });
}

void loop()
{
    // Periodic heartbeat so we always know firmware is alive.
    const unsigned long now = millis();
    if (now - lastHeartbeatAt >= HEARTBEAT_INTERVAL_MS)
    {
        lastHeartbeatAt = now;
        debugLine("HEARTBEAT firmware alive waiting for PZEM data");
    }

    // Explicit read each second for deterministic diagnostics.
    if (now - lastSendAt >= SEND_INTERVAL_MS)
    {
        lastSendAt = now;
        if (!pzem.read())
        {
            debugLine("PZEM read failed no response timeout");
        }
    }

    delay(10);
}
