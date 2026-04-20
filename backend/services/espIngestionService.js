const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const Meter = require('../models/Meter');
const Reading = require('../models/Reading');
const Alert = require('../models/Alert');

const DEFAULT_METER_ID = process.env.ESP_DEFAULT_METER_ID || 'MTR-1001';
const HIGH_USAGE_THRESHOLD_WATTS = Number(process.env.HIGH_USAGE_THRESHOLD_WATTS || 5000);
const ESP_DEBUG_LOGS = String(process.env.ESP_DEBUG_LOGS || 'false').toLowerCase() === 'true';

function debugLog(message, details = null) {
  if (!ESP_DEBUG_LOGS) {
    return;
  }

  const stamp = new Date().toISOString();
  if (details) {
    console.log(`[ESP_DEBUG ${stamp}] ${message}`, details);
    return;
  }

  console.log(`[ESP_DEBUG ${stamp}] ${message}`);
}

const runtimeState = {
  serialEnabled: false,
  serialConnected: false,
  portPath: null,
  baudRate: null,
  lastLineAt: null,
  lastHttpRequestAt: null,
  lastHttpRequestId: null,
  lastPersistAt: null,
  lastPersistSource: null,
  lastPersistMeterId: null,
  lastPersistPowerWatts: null,
  lastPersistTimestamp: null,
  totalPersisted: 0,
  totalHttpIngested: 0,
  totalSerialIngested: 0,
  lastError: null,
  totalIngested: 0,
};

function buildValidationError(message) {
  const error = new Error(message);
  error.code = 'BAD_READING';
  return error;
}

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeReadingPayload(payload, fallbackMeterId = DEFAULT_METER_ID) {
  if (!payload || typeof payload !== 'object') {
    throw buildValidationError('Reading payload must be a JSON object');
  }

  const meterId = String(payload.meterId || fallbackMeterId || '').trim();
  if (!meterId) {
    throw buildValidationError('meterId is required');
  }

  const power = toFiniteNumber(payload.power_watts ?? payload.powerWatts ?? payload.power);
  const voltage = toFiniteNumber(payload.voltage ?? payload.volt);
  let current = toFiniteNumber(payload.current ?? payload.amps ?? payload.ampere);
  let apparentPower = toFiniteNumber(
    payload.apparent_power_va
      ?? payload.apparentPower
      ?? payload.apparent_power
      ?? payload.va,
  );
  let reactivePower = toFiniteNumber(
    payload.reactive_power_var
      ?? payload.reactivePower
      ?? payload.reactive_power
      ?? payload.var,
  );
  let powerFactor = toFiniteNumber(
    payload.power_factor
      ?? payload.powerFactor
      ?? payload.pf
      ?? payload.cosphi,
  );
  let frequencyHz = toFiniteNumber(payload.frequency_hz ?? payload.frequency ?? payload.hz);
  let energyWh = toFiniteNumber(payload.energy_wh ?? payload.energyWh ?? payload.energy);
  const energyKwh = toFiniteNumber(payload.energy_kwh ?? payload.energyKwh);

  if (power === null) {
    throw buildValidationError('power_watts (or power) is required and must be numeric');
  }
  if (voltage === null) {
    throw buildValidationError('voltage is required and must be numeric');
  }
  if (current === null) {
    current = voltage === 0 ? 0 : power / voltage;
  }
  if (apparentPower === null) {
    apparentPower = voltage * current;
  }
  if (reactivePower === null && apparentPower !== null) {
    const remainder = (apparentPower ** 2) - (power ** 2);
    reactivePower = remainder > 0 ? Math.sqrt(remainder) : 0;
  }
  if (powerFactor === null && apparentPower !== null && apparentPower > 0) {
    powerFactor = power / apparentPower;
  }
  if (frequencyHz === null) {
    frequencyHz = null;
  }
  if (energyWh === null && energyKwh !== null) {
    energyWh = energyKwh * 1000;
  }

  if (power < 0 || voltage < 0 || current < 0) {
    throw buildValidationError('power_watts, voltage and current must be >= 0');
  }
  if (apparentPower !== null && apparentPower < 0) {
    throw buildValidationError('apparent_power_va must be >= 0');
  }
  if (powerFactor !== null && powerFactor < 0) {
    throw buildValidationError('power_factor must be >= 0');
  }
  if (frequencyHz !== null && frequencyHz < 0) {
    throw buildValidationError('frequency_hz must be >= 0');
  }
  if (energyWh !== null && energyWh < 0) {
    throw buildValidationError('energy_wh must be >= 0');
  }

  let timestamp = new Date();
  if (payload.timestamp) {
    const parsedTimestamp = new Date(payload.timestamp);
    if (!Number.isNaN(parsedTimestamp.getTime())) {
      timestamp = parsedTimestamp;
    }
  }

  return {
    meterId,
    timestamp,
    power_watts: Number(power.toFixed(3)),
    voltage: Number(voltage.toFixed(3)),
    current: Number(current.toFixed(3)),
    apparent_power_va: apparentPower === null ? undefined : Number(apparentPower.toFixed(3)),
    reactive_power_var: reactivePower === null ? undefined : Number(reactivePower.toFixed(3)),
    power_factor: powerFactor === null ? undefined : Number(powerFactor.toFixed(3)),
    frequency_hz: frequencyHz === null ? undefined : Number(frequencyHz.toFixed(3)),
    energy_wh: energyWh === null ? undefined : Number(energyWh.toFixed(3)),
  };
}

async function ensureMeterExists(meterId) {
  const existing = await Meter.findOne({ meterId }).select('_id');
  if (existing) {
    return;
  }

  try {
    await Meter.create({
      meterId,
      ownerName: `ESP Device ${meterId}`,
      address: 'Hardware Lab - USB Serial Ingestion',
      area: 'Zone A',
    });
  } catch (error) {
    // Ignore duplicate key errors caused by concurrent first-write attempts.
    if (!error || error.code !== 11000) {
      throw error;
    }
  }
}

async function persistReading(payload, options = {}) {
  const source = options.source || 'http';
  const requestId = options.requestId || null;

  debugLog('persistReading called', {
    source,
    requestId,
    meterId: payload?.meterId,
    hasPower: payload?.power_watts !== undefined || payload?.power !== undefined,
  });

  const normalized = normalizeReadingPayload(payload);
  await ensureMeterExists(normalized.meterId);

  const created = await Reading.create(normalized);

  runtimeState.lastPersistAt = new Date();
  runtimeState.lastPersistSource = source;
  runtimeState.lastPersistMeterId = created.meterId;
  runtimeState.lastPersistPowerWatts = created.power_watts;
  runtimeState.lastPersistTimestamp = created.timestamp;
  runtimeState.totalPersisted += 1;
  runtimeState.totalIngested = runtimeState.totalPersisted;
  if (source === 'serial') {
    runtimeState.totalSerialIngested += 1;
  } else {
    runtimeState.totalHttpIngested += 1;
    runtimeState.lastHttpRequestAt = new Date();
    runtimeState.lastHttpRequestId = requestId;
  }

  debugLog('persistReading saved', {
    source,
    requestId,
    readingId: created._id,
    meterId: created.meterId,
    timestamp: created.timestamp,
    power_watts: created.power_watts,
    voltage: created.voltage,
    current: created.current,
    totalPersisted: runtimeState.totalPersisted,
  });

  if (created.power_watts === 0) {
    await Alert.create({
      meterId: created.meterId,
      timestamp: new Date(),
      type: 'THEFT_SUSPICION',
      message: 'Power dropped to zero from ESP input. Please inspect meter wiring.',
    });
  } else if (created.power_watts >= HIGH_USAGE_THRESHOLD_WATTS) {
    await Alert.create({
      meterId: created.meterId,
      timestamp: new Date(),
      type: 'HIGH_USAGE',
      message: `High usage detected from ESP input (${created.power_watts} W).`,
    });
  }

  return created;
}

function parseKeyValueLine(line) {
  const keyAliases = {
    power_watts: 'power_watts',
    powerwatts: 'power_watts',
    power: 'power_watts',
    p: 'power_watts',
    voltage: 'voltage',
    volt: 'voltage',
    v: 'voltage',
    current: 'current',
    amps: 'current',
    amp: 'current',
    ampere: 'current',
    i: 'current',
    apparent_power_va: 'apparent_power_va',
    apparentpower: 'apparent_power_va',
    va: 'apparent_power_va',
    reactive_power_var: 'reactive_power_var',
    reactivepower: 'reactive_power_var',
    var: 'reactive_power_var',
    power_factor: 'power_factor',
    powerfactor: 'power_factor',
    pf: 'power_factor',
    cosphi: 'power_factor',
    frequency_hz: 'frequency_hz',
    frequency: 'frequency_hz',
    hz: 'frequency_hz',
    energy_wh: 'energy_wh',
    energy: 'energy_wh',
    energykwh: 'energy_kwh',
    energy_kwh: 'energy_kwh',
    meterid: 'meterId',
    meter_id: 'meterId',
    id: 'meterId',
  };

  const values = {};
  const regex = /([a-zA-Z_]+)\s*[:=]\s*([^,\s]+)/g;
  let match = regex.exec(line);

  while (match) {
    const key = String(match[1] || '').trim().toLowerCase();
    const normalizedKey = keyAliases[key];
    if (normalizedKey) {
      values[normalizedKey] = match[2];
    }
    match = regex.exec(line);
  }

  const hasNumericMeasurement = ['power_watts', 'voltage', 'current', 'apparent_power_va', 'reactive_power_var', 'power_factor', 'frequency_hz', 'energy_wh', 'energy_kwh']
    .some((key) => toFiniteNumber(values[key]) !== null);

  return hasNumericMeasurement ? values : null;
}

function parseCsvLine(line) {
  const parts = line.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) {
    return null;
  }

  return {
    power_watts: parts[0],
    voltage: parts[1],
    current: parts[2],
    meterId: parts[3],
    apparent_power_va: parts[4],
    reactive_power_var: parts[5],
    power_factor: parts[6],
    frequency_hz: parts[7],
    energy_wh: parts[8],
  };
}

function parseSerialLine(line) {
  const trimmed = String(line || '').trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      return normalizeReadingPayload(JSON.parse(trimmed));
    } catch (error) {
      throw buildValidationError(`Invalid JSON serial payload: ${error.message}`);
    }
  }

  const keyValuePayload = parseKeyValueLine(trimmed);
  if (keyValuePayload) {
    return normalizeReadingPayload(keyValuePayload);
  }

  const csvPayload = parseCsvLine(trimmed);
  if (csvPayload) {
    return normalizeReadingPayload(csvPayload);
  }

  return null;
}

function startEspSerialIngestion() {
  const serialEnabled = String(process.env.ESP_SERIAL_ENABLED || 'false').toLowerCase() === 'true';
  runtimeState.serialEnabled = serialEnabled;

  if (!serialEnabled) {
    console.log('ESP serial ingestion is disabled (set ESP_SERIAL_ENABLED=true to enable).');
    return null;
  }

  const portPath = process.env.ESP_SERIAL_PORT;
  const baudRate = Number(process.env.ESP_SERIAL_BAUD_RATE || 9600);
  const reconnectDelayMs = Number(process.env.ESP_SERIAL_RECONNECT_MS || 3000);

  runtimeState.portPath = portPath || null;
  runtimeState.baudRate = baudRate;

  if (!portPath) {
    runtimeState.lastError = 'ESP_SERIAL_PORT is not configured';
    console.warn('ESP serial enabled but ESP_SERIAL_PORT is missing. Example: ESP_SERIAL_PORT=COM3');
    return null;
  }

  const port = new SerialPort({
    path: portPath,
    baudRate,
    autoOpen: false,
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
  let shouldReconnect = true;

  const tryOpen = () => {
    if (!shouldReconnect || port.isOpen) {
      return;
    }

    port.open((error) => {
      if (error) {
        runtimeState.lastError = error.message;
        console.error(`ESP serial open failed: ${error.message}`);
        setTimeout(tryOpen, reconnectDelayMs);
      }
    });
  };

  port.on('open', () => {
    runtimeState.serialConnected = true;
    runtimeState.lastError = null;
    console.log(`ESP serial connected on ${portPath} @ ${baudRate}`);
  });

  port.on('close', () => {
    runtimeState.serialConnected = false;
    console.warn('ESP serial connection closed. Reconnecting...');
    if (shouldReconnect) {
      setTimeout(tryOpen, reconnectDelayMs);
    }
  });

  port.on('error', (error) => {
    runtimeState.lastError = error.message;
    console.error(`ESP serial error: ${error.message}`);
  });

  parser.on('data', async (line) => {
    runtimeState.lastLineAt = new Date();

    try {
      const normalized = parseSerialLine(line);
      if (!normalized) {
        debugLog('serial line ignored (no telemetry keys)', {
          raw: String(line || '').trim().slice(0, 180),
        });
        return;
      }

      await persistReading(normalized, { source: 'serial' });
    } catch (error) {
      runtimeState.lastError = error.message;
      console.error(`ESP line rejected: ${error.message}`);
    }
  });

  tryOpen();

  return {
    stop: () => {
      shouldReconnect = false;
      if (port.isOpen) {
        port.close();
      }
    },
  };
}

function getEspIngestionStatus() {
  return {
    serialEnabled: runtimeState.serialEnabled,
    serialConnected: runtimeState.serialConnected,
    portPath: runtimeState.portPath,
    baudRate: runtimeState.baudRate,
    defaultMeterId: DEFAULT_METER_ID,
    debugLogsEnabled: ESP_DEBUG_LOGS,
    totalIngested: runtimeState.totalIngested,
    totalPersisted: runtimeState.totalPersisted,
    totalHttpIngested: runtimeState.totalHttpIngested,
    totalSerialIngested: runtimeState.totalSerialIngested,
    lastLineAt: runtimeState.lastLineAt,
    lastHttpRequestAt: runtimeState.lastHttpRequestAt,
    lastHttpRequestId: runtimeState.lastHttpRequestId,
    lastPersistAt: runtimeState.lastPersistAt,
    lastPersistSource: runtimeState.lastPersistSource,
    lastPersistMeterId: runtimeState.lastPersistMeterId,
    lastPersistPowerWatts: runtimeState.lastPersistPowerWatts,
    lastPersistTimestamp: runtimeState.lastPersistTimestamp,
    lastError: runtimeState.lastError,
  };
}

module.exports = {
  normalizeReadingPayload,
  persistReading,
  startEspSerialIngestion,
  getEspIngestionStatus,
};
