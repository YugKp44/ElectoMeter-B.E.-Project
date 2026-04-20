require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const { seedDatabase, startLiveDataGeneration } = require('./services/simulationService');
const { startEspSerialIngestion } = require('./services/espIngestionService');
const { createDefaultAdmin } = require('./controllers/adminController');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-meter';
const IS_PRODUCTION = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
const SHOULD_SEED_DATABASE = String(process.env.SEED_DATABASE || (IS_PRODUCTION ? 'false' : 'true')).toLowerCase() === 'true';
const ENABLE_SIMULATION = String(process.env.ENABLE_SIMULATION || (IS_PRODUCTION ? 'false' : 'true')).toLowerCase() === 'true';

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
      serverSelectionTimeoutMS: 30000,
    });
    console.log('✓ Connected to MongoDB');

    // Start Express server immediately so hosting platforms can detect open port.
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
    });

    // Create default admin account
    await createDefaultAdmin();

    // Seed database with initial data
    if (SHOULD_SEED_DATABASE) {
      await seedDatabase();
    } else {
      console.log('Database seeding skipped (SEED_DATABASE=false).');
    }

    // Start simulated live data generation when enabled
    if (ENABLE_SIMULATION) {
      startLiveDataGeneration();
    } else {
      console.log('Simulation disabled (ENABLE_SIMULATION=false).');
    }

    // Start ESP serial ingestion service when enabled
    startEspSerialIngestion();
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
