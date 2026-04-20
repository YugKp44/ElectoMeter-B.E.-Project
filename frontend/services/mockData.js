const BILL_RATE_PER_KWH = 8;

function toRound(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function generateMockLiveReading(meterId = 'MTR-1001') {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const wave = Math.sin((minutes / 1440) * Math.PI * 4);
  const power = Math.max(80, 360 + wave * 140 + (Math.random() * 30 - 15));
  const voltage = 228 + Math.sin(minutes / 180) * 4;
  const current = power / voltage;
  const apparentPower = voltage * current;
  const powerFactor = Math.min(0.99, Math.max(0.82, power / apparentPower));
  const reactivePower = Math.sqrt(Math.max((apparentPower ** 2) - (power ** 2), 0));
  const frequency = 50 + Math.sin(minutes / 90) * 0.15;

  return {
    meterId,
    timestamp: now.toISOString(),
    power_watts: toRound(power, 2),
    voltage: toRound(voltage, 2),
    current: toRound(current, 3),
    apparent_power_va: toRound(apparentPower, 2),
    reactive_power_var: toRound(reactivePower, 2),
    power_factor: toRound(powerFactor, 3),
    frequency_hz: toRound(frequency, 2),
    energy_wh: null,
  };
}

function getHistoryConfig(period) {
  if (period === '6h') {
    return { hours: 6, stepMinutes: 5 };
  }
  if (period === '7d') {
    return { hours: 24 * 7, stepMinutes: 60 };
  }
  return { hours: 24, stepMinutes: 15 };
}

export function generateMockHistoricalReadings(meterId = 'MTR-1001', period = '24h') {
  const { hours, stepMinutes } = getHistoryConfig(period);
  const now = Date.now();
  const totalPoints = Math.max(2, Math.floor((hours * 60) / stepMinutes));
  const readings = [];

  for (let i = totalPoints; i >= 0; i -= 1) {
    const timestamp = new Date(now - i * stepMinutes * 60 * 1000);
    const phase = (timestamp.getTime() / (1000 * 60 * 60)) * 0.7;
    const baseline = period === '7d' ? 430 : 360;
    const oscillation = Math.sin(phase) * 120 + Math.cos(phase * 0.4) * 55;
    const jitter = Math.random() * 24 - 12;
    const power = Math.max(50, baseline + oscillation + jitter);
    const voltage = 227 + Math.sin(phase * 0.6) * 4;

    readings.push({
      meterId,
      timestamp: timestamp.toISOString(),
      power_watts: toRound(power, 2),
      voltage: toRound(voltage, 1),
      current: toRound(power / voltage, 3),
    });
  }

  return readings;
}

export function generateMockBills(meterId = 'MTR-1001', count = 4) {
  const current = new Date();
  const bills = [];

  for (let i = 0; i < count; i += 1) {
    const monthDate = new Date(current.getFullYear(), current.getMonth() - i, 1);
    const month = monthDate.getMonth() + 1;
    const year = monthDate.getFullYear();

    const base = 240;
    const seasonal = Math.sin((month / 12) * Math.PI * 2) * 35;
    const randomPart = Math.random() * 30;
    const totalKwh = toRound(base + seasonal + randomPart, 2);
    const amountDue = toRound(totalKwh * BILL_RATE_PER_KWH, 2);
    const status = i === 0 ? 'DUE' : 'PAID';
    const dueDate = new Date(year, month, 15);

    bills.push({
      meterId,
      month,
      year,
      total_kwh: totalKwh,
      amount_due: amountDue,
      status,
      dueDate: dueDate.toISOString(),
      isMock: true,
    });
  }

  return bills;
}
