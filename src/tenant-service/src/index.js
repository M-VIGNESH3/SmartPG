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
  .then(() => console.log('Connected to MongoDB - Tenant Service'))
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
