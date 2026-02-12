const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  meterId: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true, default: Date.now },
  power_watts: { type: Number, required: true }, // Instantaneous power in Watts
  voltage: { type: Number, required: true },
  current: { type: Number, required: true }
});

// Create compound index for efficient time-series queries
readingSchema.index({ meterId: 1, timestamp: -1 });

module.exports = mongoose.model('Reading', readingSchema);
