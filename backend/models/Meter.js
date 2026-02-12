const mongoose = require('mongoose');

const meterSchema = new mongoose.Schema({
  meterId: { type: String, required: true, unique: true }, // e.g., 'MTR-1001'
  ownerName: { type: String, required: true },
  address: { type: String, required: true },
  area: { type: String, default: 'Zone A' }, // Area/Zone classification
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meter', meterSchema);
