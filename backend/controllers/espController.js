const {
  persistReading,
  getEspIngestionStatus,
} = require('../services/espIngestionService');

function isAuthorized(req) {
  const requiredApiKey = process.env.ESP_API_KEY;
  if (!requiredApiKey) {
    return true;
  }

  const providedApiKey = req.header('x-esp-api-key');
  return providedApiKey === requiredApiKey;
}

exports.ingestReading = async (req, res) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized ESP request' });
    }

    const created = await persistReading(req.body);

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
      return res.status(400).json({ error: error.message });
    }

    console.error('Error ingesting ESP reading:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEspStatus = (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized ESP request' });
  }

  return res.json(getEspIngestionStatus());
};
