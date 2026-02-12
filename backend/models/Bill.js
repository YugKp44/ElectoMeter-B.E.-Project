const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  meterId: { type: String, required: true },
  month: { type: Number, required: true }, // e.g., 10 for October
  year: { type: Number, required: true },
  total_kwh: { type: Number, required: true },
  amount_due: { type: Number, required: true },
  status: { type: String, enum: ['DUE', 'PAID'], default: 'DUE' },
  dueDate: { type: Date, required: true }
});

// Compound index to ensure unique bills per month/year
billSchema.index({ meterId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Bill', billSchema);
