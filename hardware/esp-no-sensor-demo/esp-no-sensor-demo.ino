const unsigned long BAUD_RATE = 9600;
const unsigned long SEND_INTERVAL_MS = 1000;
const unsigned long MODE_DURATION_MS = 20000;

const char *METER_ID = "MTR-1001";

enum DemoMode
{
    MODE_IDLE,
    MODE_NORMAL,
    MODE_HIGH,
    MODE_THEFT
};

DemoMode currentMode = MODE_IDLE;
unsigned long lastSendAt = 0;
unsigned long modeStartedAt = 0;

float randomFloat(float minValue, float maxValue)
{
    float ratio = random(0, 10000) / 10000.0f;
    return minValue + ((maxValue - minValue) * ratio);
}

void rotateModeIfNeeded()
{
    if (millis() - modeStartedAt < MODE_DURATION_MS)
    {
        return;
    }

    modeStartedAt = millis();
    currentMode = static_cast<DemoMode>((currentMode + 1) % 4);
}

float getCurrentForMode(DemoMode mode)
{
    switch (mode)
    {
    case MODE_IDLE:
        return randomFloat(0.03f, 0.08f);
    case MODE_NORMAL:
        return randomFloat(0.25f, 0.60f);
    case MODE_HIGH:
        // Intentionally high to demo high-usage behavior in app/backend.
        return randomFloat(21.0f, 25.0f);
    case MODE_THEFT:
        return 0.0f;
    default:
        return 0.0f;
    }
}

void setup()
{
    Serial.begin(BAUD_RATE);
    randomSeed((unsigned long)micros());
    modeStartedAt = millis();
    delay(1200);
}

void loop()
{
    rotateModeIfNeeded();

    if (millis() - lastSendAt < SEND_INTERVAL_MS)
    {
        return;
    }

    lastSendAt = millis();

    float voltage = randomFloat(228.0f, 232.0f);
    float current = getCurrentForMode(currentMode);
    float power = voltage * current;

    // CSV format expected by backend serial parser: power,voltage,current,meterId
    Serial.print(power, 2);
    Serial.print(",");
    Serial.print(voltage, 2);
    Serial.print(",");
    Serial.print(current, 3);
    Serial.print(",");
    Serial.println(METER_ID);
}
