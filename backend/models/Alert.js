const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  meterId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['THEFT_SUSPICION', 'HIGH_USAGE'], required: true },
  message: { type: String, required: true }
});

// Index for efficient alert queries
alertSchema.index({ meterId: 1, timestamp: -1 });

module.exports = mongoose.model('Alert', alertSchema);
