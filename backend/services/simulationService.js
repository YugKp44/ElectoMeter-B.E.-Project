const Meter = require('../models/Meter');
const Reading = require('../models/Reading');
const Bill = require('../models/Bill');
const Alert = require('../models/Alert');

const METER_ID = 'MTR-1001';
const BASE_POWER = 300; // Base power consumption in watts
const VOLTAGE_NOMINAL = 230; // Nominal voltage in volts

// Generate a random power reading with fluctuations
function generatePowerReading() {
  // Random fluctuation between -50W to +200W
  const fluctuation = Math.random() * 250 - 50;
  const power = Math.max(0, BASE_POWER + fluctuation);
  
  // Simulate theft with 1% chance (power drops to 0)
  if (Math.random() < 0.01) {
    return 0;
  }
  
  return Math.round(power * 100) / 100; // Round to 2 decimal places
}

// Generate voltage with small fluctuations
function generateVoltage() {
  const fluctuation = Math.random() * 10 - 5; // ±5V fluctuation
  return Math.round((VOLTAGE_NOMINAL + fluctuation) * 10) / 10;
}

// Calculate current based on power and voltage
function calculateCurrent(power, voltage) {
  if (voltage === 0) return 0;
  return Math.round((power / voltage) * 100) / 100;
}

// Seed initial data
async function seedDatabase() {
  try {
    // Check if meter already exists
    const existingMeter = await Meter.findOne({ meterId: METER_ID });
    
    if (existingMeter) {
      console.log('Database already seeded. Skipping initial seed.');
      return;
    }
    
    console.log('Seeding database with initial data...');
    
    // Create 50 meters across different zones with realistic data
    const meters = [
      // Zone A - Andheri Residential (10 meters)
      { meterId: 'MTR-1001', ownerName: 'Rajesh Kumar', address: '123 MG Road, Andheri East, Mumbai - 400069', area: 'Zone A' },
      { meterId: 'MTR-1002', ownerName: 'Priya Sharma', address: '456 SV Road, Andheri West, Mumbai - 400058', area: 'Zone A' },
      { meterId: 'MTR-1003', ownerName: 'Amit Patel', address: '789 Linking Road, Andheri, Mumbai - 400053', area: 'Zone A' },
      { meterId: 'MTR-1004', ownerName: 'Sneha Deshmukh', address: '12 Veera Desai Road, Andheri, Mumbai - 400053', area: 'Zone A' },
      { meterId: 'MTR-1005', ownerName: 'Vikram Singh', address: '34 Yari Road, Andheri West, Mumbai - 400061', area: 'Zone A' },
      { meterId: 'MTR-1006', ownerName: 'Meera Iyer', address: '56 JP Road, Andheri West, Mumbai - 400058', area: 'Zone A' },
      { meterId: 'MTR-1007', ownerName: 'Arjun Kapoor', address: '78 New Link Road, Andheri, Mumbai - 400053', area: 'Zone A' },
      { meterId: 'MTR-1008', ownerName: 'Kavita Reddy', address: '90 Lokhandwala, Andheri West, Mumbai - 400053', area: 'Zone A' },
      { meterId: 'MTR-1009', ownerName: 'Sanjay Gupta', address: '11 Seven Bungalows, Andheri West, Mumbai - 400061', area: 'Zone A' },
      { meterId: 'MTR-1010', ownerName: 'Pooja Malhotra', address: '22 DN Nagar, Andheri West, Mumbai - 400058', area: 'Zone A' },
      
      // Zone B - BKC Commercial (10 meters)
      { meterId: 'MTR-1011', ownerName: 'Tech Solutions Pvt Ltd', address: '12 BKC, G Block, Mumbai - 400051', area: 'Zone B' },
      { meterId: 'MTR-1012', ownerName: 'Infosys Technologies', address: '34 BKC, C Block, Mumbai - 400051', area: 'Zone B' },
      { meterId: 'MTR-1013', ownerName: 'ICICI Bank Corporate', address: '56 BKC, E Block, Mumbai - 400051', area: 'Zone B' },
      { meterId: 'MTR-1014', ownerName: 'Reliance Industries Office', address: '78 BKC, A Block, Mumbai - 400051', area: 'Zone B' },
      { meterId: 'MTR-1015', ownerName: 'Green Cafe & Restaurant', address: '90 Lower Parel, Mumbai - 400013', area: 'Zone B' },
      { meterId: 'MTR-1016', ownerName: 'Style Fashion Store', address: '11 Colaba Causeway, Mumbai - 400005', area: 'Zone B' },
      { meterId: 'MTR-1017', ownerName: 'FitZone Gym', address: '22 Worli Sea Face, Mumbai - 400018', area: 'Zone B' },
      { meterId: 'MTR-1018', ownerName: 'Mumbai Hotel & Suites', address: '33 Nariman Point, Mumbai - 400021', area: 'Zone B' },
      { meterId: 'MTR-1019', ownerName: 'StarBucks Coffee', address: '44 Fort, Mumbai - 400001', area: 'Zone B' },
      { meterId: 'MTR-1020', ownerName: 'PVR Cinemas', address: '55 Phoenix Mall, Lower Parel, Mumbai - 400013', area: 'Zone B' },
      
      // Zone C - MIDC Industrial (10 meters)
      { meterId: 'MTR-1021', ownerName: 'ABC Manufacturing Ltd', address: 'Plot 45, MIDC Andheri, Mumbai - 400093', area: 'Zone C' },
      { meterId: 'MTR-1022', ownerName: 'Precision Tools Co.', address: 'Plot 67, Kurla Industrial, Mumbai - 400070', area: 'Zone C' },
      { meterId: 'MTR-1023', ownerName: 'Metro Textiles', address: 'Plot 89, Chandivali, Mumbai - 400072', area: 'Zone C' },
      { meterId: 'MTR-1024', ownerName: 'Steel Industries Ltd', address: 'Plot 12, MIDC Andheri, Mumbai - 400093', area: 'Zone C' },
      { meterId: 'MTR-1025', ownerName: 'Pharma Labs India', address: 'Plot 34, MIDC Andheri, Mumbai - 400093', area: 'Zone C' },
      { meterId: 'MTR-1026', ownerName: 'Auto Parts Manufacturing', address: 'Plot 56, Kurla Industrial, Mumbai - 400070', area: 'Zone C' },
      { meterId: 'MTR-1027', ownerName: 'Chemical Solutions Pvt Ltd', address: 'Plot 78, MIDC Andheri, Mumbai - 400093', area: 'Zone C' },
      { meterId: 'MTR-1028', ownerName: 'Packaging Industries', address: 'Plot 90, Chandivali, Mumbai - 400072', area: 'Zone C' },
      { meterId: 'MTR-1029', ownerName: 'Electronics Assembly Unit', address: 'Plot 23, MIDC Andheri, Mumbai - 400093', area: 'Zone C' },
      { meterId: 'MTR-1030', ownerName: 'Food Processing Plant', address: 'Plot 45, Kurla Industrial, Mumbai - 400070', area: 'Zone C' },
      
      // Zone D - Bandra Mixed Use (10 meters)
      { meterId: 'MTR-1031', ownerName: 'Sunita Desai', address: '23 Hill Road, Bandra West, Mumbai - 400050', area: 'Zone D' },
      { meterId: 'MTR-1032', ownerName: 'Rahul Nair', address: '45 Linking Road, Bandra West, Mumbai - 400050', area: 'Zone D' },
      { meterId: 'MTR-1033', ownerName: 'Smart Mart Supermarket', address: '67 Turner Road, Bandra West, Mumbai - 400050', area: 'Zone D' },
      { meterId: 'MTR-1034', ownerName: 'Dr. Mehta Clinic', address: '89 Perry Cross Road, Bandra West, Mumbai - 400050', area: 'Zone D' },
      { meterId: 'MTR-1035', ownerName: 'Neha Chopra', address: '12 Chapel Road, Bandra West, Mumbai - 400050', area: 'Zone D' },
      { meterId: 'MTR-1036', ownerName: 'Karan Johar Residence', address: '34 Union Park, Bandra West, Mumbai - 400050', area: 'Zone D' },
      { meterId: 'MTR-1037', ownerName: 'Bandra Cafe Lounge', address: '56 Waterfield Road, Bandra West, Mumbai - 400050', area: 'Zone D' },
      { meterId: 'MTR-1038', ownerName: 'The Bookstore', address: '78 Pali Hill, Bandra West, Mumbai - 400050', area: 'Zone D' },
      { meterId: 'MTR-1039', ownerName: 'Yoga Studio Wellness', address: '90 Carter Road, Bandra West, Mumbai - 400050', area: 'Zone D' },
      { meterId: 'MTR-1040', ownerName: 'Dental Care Clinic', address: '13 St Andrews Road, Bandra West, Mumbai - 400050', area: 'Zone D' },
      
      // Zone E - Goregaon High-Rise (10 meters)
      { meterId: 'MTR-1041', ownerName: 'Skyline Towers - Wing A', address: 'Plot 1, Goregaon East, Mumbai - 400063', area: 'Zone E' },
      { meterId: 'MTR-1042', ownerName: 'Skyline Towers - Wing B', address: 'Plot 1, Goregaon East, Mumbai - 400063', area: 'Zone E' },
      { meterId: 'MTR-1043', ownerName: 'Ocean View Apartments', address: 'Plot 2, Versova, Mumbai - 400061', area: 'Zone E' },
      { meterId: 'MTR-1044', ownerName: 'Metro Heights Complex', address: 'Plot 3, Goregaon West, Mumbai - 400062', area: 'Zone E' },
      { meterId: 'MTR-1045', ownerName: 'Royal Residency - Tower 1', address: 'Plot 4, Goregaon East, Mumbai - 400063', area: 'Zone E' },
      { meterId: 'MTR-1046', ownerName: 'Royal Residency - Tower 2', address: 'Plot 4, Goregaon East, Mumbai - 400063', area: 'Zone E' },
      { meterId: 'MTR-1047', ownerName: 'Green Park Society', address: 'Plot 5, Goregaon West, Mumbai - 400062', area: 'Zone E' },
      { meterId: 'MTR-1048', ownerName: 'Sunrise Apartments', address: 'Plot 6, Malad West, Mumbai - 400064', area: 'Zone E' },
      { meterId: 'MTR-1049', ownerName: 'Elite Towers', address: 'Plot 7, Goregaon East, Mumbai - 400063', area: 'Zone E' },
      { meterId: 'MTR-1050', ownerName: 'Paradise Residency', address: 'Plot 8, Versova, Mumbai - 400061', area: 'Zone E' },
    ];

    await Meter.insertMany(meters);
    console.log(`✓ ${meters.length} Meters created across multiple zones`);
    
    // Generate 7 days of historical readings for all meters
    const readings = [];
    const now = new Date();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    for (const meter of meters) {
      for (let i = SEVEN_DAYS; i >= 0; i -= INTERVAL) {
        const timestamp = new Date(now.getTime() - i);
        const power = generatePowerReading();
        const voltage = generateVoltage();
        const current = calculateCurrent(power, voltage);
        
        readings.push({
          meterId: meter.meterId,
          timestamp,
          power_watts: power,
          voltage,
          current
        });
      }
    }
    
    await Reading.insertMany(readings);
    console.log(`✓ ${readings.length} historical readings created for all meters`);
    
    // Generate sample bills for the last 4 months for all meters
    const bills = [];
    const currentDate = new Date();
    const RATE_PER_KWH = 8; // ₹8 per kWh
    
    for (const meter of meters) {
      for (let i = 0; i < 4; i++) {
        const billMonth = currentDate.getMonth() - i;
        const billYear = currentDate.getFullYear() + Math.floor(billMonth / 12);
        const normalizedMonth = ((billMonth % 12) + 12) % 12 + 1;
      
        // Generate random consumption between 200-400 kWh
        const totalKwh = Math.round((Math.random() * 200 + 200) * 100) / 100;
        const amountDue = Math.round(totalKwh * RATE_PER_KWH * 100) / 100;
        
        // First bill is DUE, others are PAID
        const status = i === 0 ? 'DUE' : 'PAID';
        
        // Due date is 15th of next month
        const dueDate = new Date(billYear, normalizedMonth, 15);
        
        bills.push({
          meterId: meter.meterId,
          month: normalizedMonth,
          year: billYear,
          total_kwh: totalKwh,
          amount_due: amountDue,
          status,
          dueDate
        });
      }
    }
    
    await Bill.insertMany(bills);
    console.log(`✓ ${bills.length} sample bills created for all meters`);
    
    // Generate sample alerts for multiple meters
    const alerts = [];
    for (const meter of meters) {
      if (Math.random() > 0.5) {
        alerts.push({
          meterId: meter.meterId,
          timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          type: 'HIGH_USAGE',
          message: 'Unusually high power consumption detected. Please check your appliances.'
        });
      }
      if (Math.random() > 0.7) {
        alerts.push({
          meterId: meter.meterId,
          timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          type: 'THEFT_SUSPICION',
          message: 'Sudden power drop detected. Potential meter bypass or tampering suspected.'
        });
      }
    }
    
    if (alerts.length > 0) {
      await Alert.insertMany(alerts);
      console.log(`✓ ${alerts.length} sample alerts created for meters`);
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Generate live readings continuously for all meters
async function startLiveDataGeneration() {
  console.log('Starting live data generation for all meters (every 5 seconds)...');
  
  setInterval(async () => {
    try {
      // Get all meters
      const meters = await Meter.find();
      
      // Generate readings for each meter
      for (const meter of meters) {
        const power = generatePowerReading();
        const voltage = generateVoltage();
        const current = calculateCurrent(power, voltage);
        
        await Reading.create({
          meterId: meter.meterId,
          timestamp: new Date(),
          power_watts: power,
          voltage,
          current
        });
        
        // Check for theft (power = 0)
        if (power === 0) {
          await Alert.create({
            meterId: meter.meterId,
            timestamp: new Date(),
            type: 'THEFT_SUSPICION',
            message: 'Sudden power drop detected. Potential meter bypass or tampering suspected.'
          });
          console.log(`⚠ Theft alert generated for ${meter.meterId}!`);
        }
      }
      
      console.log(`📊 Generated ${meters.length} new readings across all meters`);
    } catch (error) {
      console.error('Error generating live readings:', error);
    }
  }, 5000); // Every 5 seconds
}

module.exports = {
  seedDatabase,
  startLiveDataGeneration
};
