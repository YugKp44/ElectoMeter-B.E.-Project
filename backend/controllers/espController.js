const {
  persistReading,
  getEspIngestionStatus,
} = require('../services/espIngestionService');

const ESP_DEBUG_LOGS = String(process.env.ESP_DEBUG_LOGS || 'false').toLowerCase() === 'true';

function logDebug(message, details = null) {
  if (!ESP_DEBUG_LOGS) {
    return;
  }

  const stamp = new Date().toISOString();
  if (details) {
    console.log(`[ESP_HTTP ${stamp}] ${message}`, details);
    return;
  }

  console.log(`[ESP_HTTP ${stamp}] ${message}`);
}

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']
    || req.socket?.remoteAddress
    || req.ip
    || 'unknown'
  );
}

function isAuthorized(req) {
  const requiredApiKey = process.env.ESP_API_KEY;
  if (!requiredApiKey) {
    return true;
  }

  const providedApiKey = req.header('x-esp-api-key');
  return providedApiKey === requiredApiKey;
}

exports.ingestReading = async (req, res) => {
  const requestId = `esp-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  try {
    logDebug('ingest request received', {
      requestId,
      ip: getClientIp(req),
      meterId: req.body?.meterId,
      bodyKeys: Object.keys(req.body || {}),
      hasApiKeyHeader: Boolean(req.header('x-esp-api-key')),
      contentType: req.headers['content-type'],
    });

    if (!isAuthorized(req)) {
      console.warn(`[ESP_HTTP] Unauthorized ESP request`, {
        requestId,
        ip: getClientIp(req),
        meterId: req.body?.meterId,
      });
      return res.status(401).json({ error: 'Unauthorized ESP request' });
    }

    const created = await persistReading(req.body, {
      source: 'http',
      requestId,
      clientIp: getClientIp(req),
    });

    logDebug('ingest persisted', {
      requestId,
      readingId: created._id,
      meterId: created.meterId,
      timestamp: created.timestamp,
      power_watts: created.power_watts,
    });

    return res.status(201).json({
      message: 'Reading ingested successfully',
      reading: {
        id: created._id,
        meterId: created.meterId,
        timestamp: created.timestamp,
        power_watts: created.power_watts,
        voltage: created.voltage,
        current: created.current,
      },
    });
  } catch (error) {
    if (error && error.code === 'BAD_READING') {
      console.warn(`[ESP_HTTP] Bad reading payload`, {
        requestId,
        ip: getClientIp(req),
        message: error.message,
        body: req.body,
      });
      return res.status(400).json({ error: error.message });
    }

    console.error('Error ingesting ESP reading:', {
      requestId,
      ip: getClientIp(req),
      message: error?.message,
      stack: error?.stack,
      body: req.body,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEspStatus = (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized ESP request' });
  }

  logDebug('status requested', {
    ip: getClientIp(req),
  });

  return res.json(getEspIngestionStatus());
};
