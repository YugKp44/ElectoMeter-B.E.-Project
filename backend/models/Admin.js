const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'super_admin'],
  },
  permissions: {
    viewAllMeters: { type: Boolean, default: true },
    viewAllBills: { type: Boolean, default: true },
    viewAllAlerts: { type: Boolean, default: true },
    updateBills: { type: Boolean, default: true },
    manageMeters: { type: Boolean, default: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
});

module.exports = mongoose.model('Admin', adminSchema);
