const unsigned long BAUD_RATE = 9600;
const unsigned long SEND_INTERVAL_MS = 2000;

const char *METER_ID = "MTR-1001";
const float BASE_VOLTAGE = 230.0f;
const float BASE_CURRENT = 0.45f;
const float CURRENT_VARIATION = 0.20f;

unsigned long lastSendAt = 0;

float randomFloat(float minValue, float maxValue)
{
    float ratio = random(0, 10000) / 10000.0f;
    return minValue + ((maxValue - minValue) * ratio);
}

void setup()
{
    Serial.begin(BAUD_RATE);
    randomSeed((unsigned long)millis());
    delay(1200);
}

void loop()
{
    if (millis() - lastSendAt < SEND_INTERVAL_MS)
    {
        return;
    }

    lastSendAt = millis();

    float voltage = randomFloat(BASE_VOLTAGE - 2.5f, BASE_VOLTAGE + 2.5f);
    float current = randomFloat(BASE_CURRENT - CURRENT_VARIATION, BASE_CURRENT + CURRENT_VARIATION);
    if (current < 0.0f)
    {
        current = 0.0f;
    }

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
