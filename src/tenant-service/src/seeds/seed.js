const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Tenant = require('../models/Tenant');
const Room = require('../models/Room');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/smartpg_db?authSource=admin');
    console.log('Connected to MongoDB for seeding');

    // Admin Account
    const adminExists = await Tenant.findOne({ email: 'admin@smartpg.com' });
    if (!adminExists) {
      await Tenant.create({
        name: 'Admin User',
        email: 'admin@smartpg.com',
        password: 'Admin@123',
        phone: '1234567890',
        role: 'admin'
      });
      console.log('Created Admin User: admin@smartpg.com');
    } else {
      console.log('Admin User already exists.');
    }

    // Rooms (101-103 Single, 201-203 Double, 301-304 Triple)
    const rooms = [
      { roomNumber: '101', floor: 1, type: 'single', rent: 8000, amenities: ['WiFi', 'AC'] },
      { roomNumber: '102', floor: 1, type: 'single', rent: 8000, amenities: ['WiFi', 'AC'] },
      { roomNumber: '103', floor: 1, type: 'single', rent: 8000, amenities: ['WiFi'] },
      { roomNumber: '201', floor: 2, type: 'double', rent: 6000, amenities: ['WiFi', 'Geyser'] },
      { roomNumber: '202', floor: 2, type: 'double', rent: 6000, amenities: ['WiFi', 'Geyser'] },
      { roomNumber: '203', floor: 2, type: 'double', rent: 6000, amenities: ['WiFi', 'Balcony'] },
      { roomNumber: '301', floor: 3, type: 'triple', rent: 5000, amenities: ['WiFi'] },
      { roomNumber: '302', floor: 3, type: 'triple', rent: 5000, amenities: ['WiFi'] },
      { roomNumber: '303', floor: 3, type: 'triple', rent: 5000, amenities: ['WiFi'] },
      { roomNumber: '304', floor: 3, type: 'triple', rent: 5000, amenities: ['WiFi'] },
    ];

    for (let r of rooms) {
      let room = await Room.findOne({ roomNumber: r.roomNumber });
      if (!room) {
        room = await Room.create(r);
        console.log(`Created Room ${r.roomNumber}`);
      }
    }

    // Demo Tenants
    const tenantData = [
      { name: 'Rahul Sharma', email: 'rahul@smartpg.com', password: 'Tenant@123', phone: '9876543210', roomNumber: '101' },
      { name: 'Priya Patel', email: 'priya@smartpg.com', password: 'Tenant@123', phone: '9876543211', roomNumber: '102' },
      { name: 'Amit Kumar', email: 'amit@smartpg.com', password: 'Tenant@123', phone: '9876543212', roomNumber: '103' }
    ];

    for (let t of tenantData) {
      let tenant = await Tenant.findOne({ email: t.email });
      if (!tenant) {
        const room = await Room.findOne({ roomNumber: t.roomNumber });
        tenant = await Tenant.create({
          name: t.name,
          email: t.email,
          password: t.password,
          phone: t.phone,
          role: 'tenant',
          roomId: room ? room._id : null
        });
        
        if (room) {
          room.occupants = room.occupants || [];
          room.occupants.push(tenant._id);
          room.isAvailable = room.occupants.length < (room.type === 'single' ? 1 : room.type === 'double' ? 2 : 3);
          await room.save();
        }
        console.log(`Created Tenant ${t.email}`);
      } else {
        console.log(`Tenant ${t.email} already exists.`);
      }
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
