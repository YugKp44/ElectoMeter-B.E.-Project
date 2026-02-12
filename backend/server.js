require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const { seedDatabase, startLiveDataGeneration } = require('./services/simulationService');
const { createDefaultAdmin } = require('./controllers/adminController');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-meter';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Energy Meter API',
    version: '1.0.0',
    status: 'running'
  });
});

// Database connection and server startup
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    console.log('✓ Connected to MongoDB');

    // Create default admin account
    await createDefaultAdmin();

    // Seed database with initial data
    await seedDatabase();

    // Start live data generation
    startLiveDataGeneration();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start the server
startServer();
