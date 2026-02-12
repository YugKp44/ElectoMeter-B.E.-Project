# Smart Energy Meter System - Backend

## Overview
Backend API for the Smart Energy Meter simulation system. Generates realistic time-series energy consumption data and serves it via RESTful endpoints.

## Features
- RESTful API for meter readings, bills, and alerts
- Automatic data generation and seeding
- Real-time energy consumption simulation
- Theft detection algorithm
- MongoDB database with optimized schemas

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the backend directory with:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smart-meter
NODE_ENV=development
```

3. Make sure MongoDB is running on your system.

## Running the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

Base URL: `http://localhost:3000/api`

### Get Live Reading
```
GET /meters/:meterId/live
```
Returns the most recent energy reading for a meter.

Example: `GET /api/meters/MTR-1001/live`

Response:
```json
{
  "meterId": "MTR-1001",
  "timestamp": "2025-11-02T10:30:00.000Z",
  "power_watts": 450.7,
  "voltage": 230.1,
  "current": 1.96
}
```

### Get Historical Readings
```
GET /meters/:meterId/history?period=24h
```
Returns historical readings for a specified period.

Periods: `6h`, `24h`, `7d`

Example: `GET /api/meters/MTR-1001/history?period=24h`

### Get Bills
```
GET /meters/:meterId/bills
```
Returns all historical bills for a meter.

Example: `GET /api/meters/MTR-1001/bills`

### Get Alerts
```
GET /meters/:meterId/alerts
```
Returns all alerts for a meter.

Example: `GET /api/meters/MTR-1001/alerts`

## Database Schema

### Meter
- meterId: String (unique)
- ownerName: String
- address: String
- createdAt: Date

### Reading
- meterId: String
- timestamp: Date
- power_watts: Number
- voltage: Number
- current: Number

### Bill
- meterId: String
- month: Number
- year: Number
- total_kwh: Number
- amount_due: Number
- status: String (DUE/PAID)
- dueDate: Date

### Alert
- meterId: String
- timestamp: Date
- type: String (THEFT_SUSPICION/HIGH_USAGE)
- message: String

## Simulation Features

- **Initial Seeding**: Creates 7 days of historical data on first run
- **Live Generation**: Creates new readings every 5 seconds
- **Theft Simulation**: 1% chance of power drop to simulate meter tampering
- **Automatic Alerts**: Generated when anomalies are detected

## Project Structure
```
backend/
├── models/           # Mongoose schemas
├── routes/           # API routes
├── controllers/      # Request handlers
├── services/         # Business logic (simulation)
├── server.js         # Main application entry
├── package.json      # Dependencies
└── .env             # Environment configuration
```
