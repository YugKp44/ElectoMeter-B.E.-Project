#include <math.h>
#include <PZEM004Tv30.h>

const unsigned long USB_BAUD_RATE = 9600;
const unsigned long PZEM_BAUD_RATE = 9600;
const unsigned long SEND_INTERVAL_MS = 2000;

const char *METER_ID = "MTR-1001";
const int PZEM_RX_PIN = 16;
const int PZEM_TX_PIN = 17;

HardwareSerial pzemSerial(2);
PZEM004Tv30 pzem(pzemSerial, PZEM_RX_PIN, PZEM_TX_PIN);

unsigned long lastSendAt = 0;

bool isValidValue(float value)
{
    return !isnan(value) && isfinite(value) && value >= 0.0f;
}

void setup()
{
    Serial.begin(USB_BAUD_RATE);
    pzemSerial.begin(PZEM_BAUD_RATE, SERIAL_8N1, PZEM_RX_PIN, PZEM_TX_PIN);
    delay(1200);
}

void loop()
{
    if (millis() - lastSendAt < SEND_INTERVAL_MS)
    {
        return;
    }

    lastSendAt = millis();

    float voltage = pzem.voltage();
    float current = pzem.current();
    float power = pzem.power();

    if (!isValidValue(voltage) || !isValidValue(current))
    {
        return;
    }

    if (!isValidValue(power))
    {
        power = voltage * current;
    }

    // CSV format expected by backend serial parser: power,voltage,current,meterId
    Serial.print(power, 2);
    Serial.print(",");
    Serial.print(voltage, 2);
    Serial.print(",");
    Serial.print(current, 3);
    Serial.print(",");
    Serial.println(METER_ID);
}
