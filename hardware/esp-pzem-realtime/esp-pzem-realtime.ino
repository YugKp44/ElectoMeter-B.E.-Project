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
        float apparentPower = data.apparentPower;
        float reactivePower = data.reactivePower;
        float powerFactor = data.powerFactor;
        float frequencyHz = data.frequency;
        float energyWh = data.activeEnergy;

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

        if (!isValidValue(apparentPower))
        {
            apparentPower = voltage * current;
        }

        if (!isValidValue(reactivePower))
        {
            const float remainder = (apparentPower * apparentPower) - (power * power);
            reactivePower = remainder > 0.0f ? sqrtf(remainder) : 0.0f;
        }

        if (!isValidValue(powerFactor))
        {
            powerFactor = apparentPower > 0.0f ? power / apparentPower : 0.0f;
        }

        if (!isValidValue(frequencyHz))
        {
            frequencyHz = 0.0f;
        }

        if (!isValidValue(energyWh))
        {
            energyWh = 0.0f;
        }

        // Clamp only tiny idle readings to zero. Both current and power must be low.
        if (current <= ZERO_CURRENT_THRESHOLD_A && power <= ZERO_POWER_THRESHOLD_W)
        {
            current = 0.0f;
            power = 0.0f;
            apparentPower = 0.0f;
            reactivePower = 0.0f;
            powerFactor = 0.0f;
        }

        // JSON format expected by backend parser, including extended telemetry fields.
        Serial.print("{\"meterId\":\"");
        Serial.print(METER_ID);
        Serial.print("\",\"power_watts\":");
        Serial.print(power, 2);
        Serial.print(",\"voltage\":");
        Serial.print(voltage, 2);
        Serial.print(",\"current\":");
        Serial.print(current, 3);
        Serial.print(",\"apparent_power_va\":");
        Serial.print(apparentPower, 2);
        Serial.print(",\"reactive_power_var\":");
        Serial.print(reactivePower, 2);
        Serial.print(",\"power_factor\":");
        Serial.print(powerFactor, 3);
        Serial.print(",\"frequency_hz\":");
        Serial.print(frequencyHz, 2);
        Serial.print(",\"energy_wh\":");
        Serial.print(energyWh, 2);
        Serial.println("}"); });
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
