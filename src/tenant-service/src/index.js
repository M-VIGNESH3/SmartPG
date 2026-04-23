const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const tenantRoutes = require('./routes/tenantRoutes');
const roomRoutes = require('./routes/roomRoutes');

const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Database Connection
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB - Tenant Service');
    
    // Seed Admin User
    const Tenant = require('./models/Tenant');
    const adminExists = await Tenant.findOne({ email: 'admin@smartpg.com' });
    if (!adminExists) {
      await Tenant.create({
        name: 'Admin User',
        email: 'admin@smartpg.com',
        password: 'admin123',
        phone: '1234567890',
        role: 'admin'
      });
      console.log('Default Admin user seeded: admin@smartpg.com / admin123');
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Health & Ready endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'tenant-service' });
});

app.get('/ready', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ status: 'ready', service: 'tenant-service', db: 'connected' });
  } else {
    res.status(503).json({ status: 'not ready', service: 'tenant-service', db: 'disconnected' });
  }
});

// Routes
app.use('/api', tenantRoutes);
app.use('/api/rooms', roomRoutes);

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Tenant Service running on port ${PORT}`);
});
