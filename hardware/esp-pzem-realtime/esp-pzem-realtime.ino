#include <math.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <MycilaPZEM.h>

const unsigned long USB_BAUD_RATE = 9600;
const unsigned long SEND_INTERVAL_MS = 1000;
const unsigned long HEARTBEAT_INTERVAL_MS = 2000;
const unsigned long CLOUD_SEND_INTERVAL_MS = 5000;
const unsigned long CLOUD_PROBE_INTERVAL_MS = 20000;
const unsigned long WIFI_CONNECT_TIMEOUT_MS = 12000;
const unsigned long WIFI_RETRY_INTERVAL_MS = 15000;
const unsigned long WIFI_SCAN_INTERVAL_MS = 30000;
const bool USB_DEBUG_ENABLED = true;
const bool CLOUD_PUSH_ENABLED = true;
const float ZERO_CURRENT_THRESHOLD_A = 0.02f;
const float ZERO_POWER_THRESHOLD_W = 3.0f;

const char *METER_ID = "MTR-1001";
const int PZEM_RX_PIN = 16;
const int PZEM_TX_PIN = 17;

// Replace with your Wi-Fi credentials.
const char *WIFI_SSID = "YOUR_WIFI_SSID";
const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Production endpoint.
const char *API_ENDPOINT = "https://electometer-b-e-project.onrender.com/api/esp/readings";
const char *STATUS_ENDPOINT = "https://electometer-b-e-project.onrender.com/api/esp/status";

// Keep empty if backend ESP_API_KEY is not configured.
const char *ESP_API_KEY = "";

Mycila::PZEM pzem;
WiFiClientSecure secureClient;

unsigned long lastSendAt = 0;
unsigned long lastHeartbeatAt = 0;
unsigned long lastCloudSendAt = 0;
unsigned long lastCloudProbeAt = 0;
unsigned long wifiAttemptStartedAt = 0;
unsigned long lastWifiScanAt = 0;
bool wifiAttemptInProgress = false;

struct MeterReading
{
    float powerWatts;
    float voltage;
    float current;
    float apparentPower;
    float reactivePower;
    float powerFactor;
    float frequencyHz;
    float energyWh;
};

MeterReading latestReading = {0};
bool hasFreshReading = false;

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

void debugValue(const String &message)
{
    if (USB_DEBUG_ENABLED)
    {
        Serial.println(message);
    }
}

void resetWifiRadio()
{
    WiFi.persistent(false);
    WiFi.disconnect(true, true);
    delay(300);
    WiFi.mode(WIFI_MODE_NULL);
    delay(200);
    WiFi.mode(WIFI_STA);
    delay(300);
}

const char *wifiStatusLabel(wl_status_t status)
{
    switch (status)
    {
    case WL_CONNECTED:
        return "WL_CONNECTED";
    case WL_NO_SSID_AVAIL:
        return "WL_NO_SSID_AVAIL";
    case WL_CONNECT_FAILED:
        return "WL_CONNECT_FAILED";
    case WL_CONNECTION_LOST:
        return "WL_CONNECTION_LOST";
    case WL_DISCONNECTED:
        return "WL_DISCONNECTED";
    case WL_IDLE_STATUS:
        return "WL_IDLE_STATUS";
    default:
        return "WL_UNKNOWN";
    }
}

void scanAndLogWifiNetworks()
{
    const unsigned long now = millis();
    if (now - lastWifiScanAt < WIFI_SCAN_INTERVAL_MS)
    {
        return;
    }
    lastWifiScanAt = now;

    debugLine("Scanning nearby WiFi networks...");
    const int count = WiFi.scanNetworks(false, true);
    if (count <= 0)
    {
        debugLine("WiFi scan found no networks");
        return;
    }

    bool targetFound = false;
    for (int i = 0; i < count; i++)
    {
        const String ssid = WiFi.SSID(i);
        const int32_t rssi = WiFi.RSSI(i);
        const int32_t channel = WiFi.channel(i);

        if (USB_DEBUG_ENABLED)
        {
            Serial.print("WiFi[");
            Serial.print(i);
            Serial.print("] SSID=");
            Serial.print(ssid);
            Serial.print(" RSSI=");
            Serial.print(rssi);
            Serial.print(" CH=");
            Serial.println(channel);
        }

        if (ssid == WIFI_SSID)
        {
            targetFound = true;
        }
    }

    if (!targetFound)
    {
        debugValue("Target SSID not visible to ESP32: " + String(WIFI_SSID));
    }
    WiFi.scanDelete();
}

void ensureWifiConnected()
{
    if (!CLOUD_PUSH_ENABLED)
    {
        return;
    }

    const wl_status_t status = WiFi.status();
    const unsigned long now = millis();

    if (status == WL_CONNECTED)
    {
        if (wifiAttemptInProgress)
        {
            debugValue("WIFI connected: " + WiFi.localIP().toString());
        }
        wifiAttemptInProgress = false;
        return;
    }

    if (status == WL_NO_SSID_AVAIL)
    {
        scanAndLogWifiNetworks();
    }

    // Avoid re-calling begin while the Wi-Fi stack is still attempting a connection.
    if (!wifiAttemptInProgress && status == WL_IDLE_STATUS)
    {
        return;
    }

    if (wifiAttemptInProgress)
    {
        if (status == WL_IDLE_STATUS && now - wifiAttemptStartedAt < WIFI_CONNECT_TIMEOUT_MS)
        {
            return;
        }

        if (now - wifiAttemptStartedAt < WIFI_CONNECT_TIMEOUT_MS && status != WL_DISCONNECTED)
        {
            return;
        }

        debugValue("WIFI connect attempt ended with status: " + String(wifiStatusLabel(status)));
        wifiAttemptInProgress = false;
    }

    if (now - wifiAttemptStartedAt < WIFI_RETRY_INTERVAL_MS)
    {
        return;
    }

    wifiAttemptStartedAt = now;
    wifiAttemptInProgress = true;
    debugValue("WIFI reconnecting...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

bool isWifiReadyForCloudPush()
{
    const wl_status_t status = WiFi.status();
    if (status == WL_CONNECTED)
    {
        return true;
    }

    if (USB_DEBUG_ENABLED)
    {
        Serial.print("Cloud push skipped, WiFi status: ");
        Serial.println(wifiStatusLabel(status));
    }

    return false;
}

bool pushReadingToCloud(const MeterReading &reading)
{
    if (!CLOUD_PUSH_ENABLED)
    {
        return false;
    }

    ensureWifiConnected();
    if (!isWifiReadyForCloudPush())
    {
        return false;
    }

    if (USB_DEBUG_ENABLED)
    {
        Serial.print("Cloud push attempt. WiFi IP: ");
        Serial.println(WiFi.localIP());
    }

    HTTPClient http;
    const bool beginOk = http.begin(secureClient, API_ENDPOINT);
    if (!beginOk)
    {
        debugLine("HTTP begin failed for API endpoint");
        return false;
    }

    http.setConnectTimeout(10000);
    http.setTimeout(10000);
    http.addHeader("Content-Type", "application/json");
    if (strlen(ESP_API_KEY) > 0)
    {
        http.addHeader("x-esp-api-key", ESP_API_KEY);
    }

    String payload = "{";
    payload += "\"meterId\":\"" + String(METER_ID) + "\",";
    payload += "\"power_watts\":" + String(reading.powerWatts, 2) + ",";
    payload += "\"voltage\":" + String(reading.voltage, 2) + ",";
    payload += "\"current\":" + String(reading.current, 3) + ",";
    payload += "\"apparent_power_va\":" + String(reading.apparentPower, 2) + ",";
    payload += "\"reactive_power_var\":" + String(reading.reactivePower, 2) + ",";
    payload += "\"power_factor\":" + String(reading.powerFactor, 3) + ",";
    payload += "\"frequency_hz\":" + String(reading.frequencyHz, 2) + ",";
    payload += "\"energy_wh\":" + String(reading.energyWh, 2);
    payload += "}";

    const int statusCode = http.POST(payload);
    const String responseBody = http.getString();
    http.end();

    debugValue("HTTP POST code: " + String(statusCode));
    if (statusCode <= 0)
    {
        debugValue("HTTP POST error: " + http.errorToString(statusCode));
    }
    if (USB_DEBUG_ENABLED)
    {
        Serial.print("HTTP response: ");
        Serial.println(responseBody);
    }

    return statusCode >= 200 && statusCode < 300;
}

void probeCloudConnectivity()
{
    if (!CLOUD_PUSH_ENABLED)
    {
        return;
    }

    ensureWifiConnected();
    if (!isWifiReadyForCloudPush())
    {
        return;
    }

    HTTPClient http;
    const bool beginOk = http.begin(secureClient, STATUS_ENDPOINT);
    if (!beginOk)
    {
        debugLine("HTTP probe begin failed");
        return;
    }

    http.setConnectTimeout(10000);
    http.setTimeout(10000);
    if (strlen(ESP_API_KEY) > 0)
    {
        http.addHeader("x-esp-api-key", ESP_API_KEY);
    }

    const int code = http.GET();
    const String body = http.getString();
    http.end();

    debugValue("HTTP probe code: " + String(code));
    if (code <= 0)
    {
        debugValue("HTTP probe error: " + http.errorToString(code));
        return;
    }

    if (USB_DEBUG_ENABLED)
    {
        Serial.print("HTTP probe body: ");
        Serial.println(body);
    }
}

void setup()
{
    Serial.begin(USB_BAUD_RATE);
    delay(1200);

    if (CLOUD_PUSH_ENABLED)
    {
        resetWifiRadio();
        debugValue("Configured SSID: " + String(WIFI_SSID));
        WiFi.setSleep(false);
        WiFi.setAutoReconnect(true);
        secureClient.setInsecure();
        ensureWifiConnected();
    }

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
        Serial.println("}");

        latestReading.powerWatts = power;
        latestReading.voltage = voltage;
        latestReading.current = current;
        latestReading.apparentPower = apparentPower;
        latestReading.reactivePower = reactivePower;
        latestReading.powerFactor = powerFactor;
        latestReading.frequencyHz = frequencyHz;
        latestReading.energyWh = energyWh;
        hasFreshReading = true; });
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

    if (CLOUD_PUSH_ENABLED && hasFreshReading && now - lastCloudSendAt >= CLOUD_SEND_INTERVAL_MS)
    {
        lastCloudSendAt = now;
        if (pushReadingToCloud(latestReading))
        {
            debugLine("Cloud push success");
        }
        else
        {
            debugLine("Cloud push failed");
        }
    }

    if (CLOUD_PUSH_ENABLED && now - lastCloudProbeAt >= CLOUD_PROBE_INTERVAL_MS)
    {
        lastCloudProbeAt = now;
        probeCloudConnectivity();
    }

    delay(10);
}
