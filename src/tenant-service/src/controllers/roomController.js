const Room = require('../models/Room');
const Tenant = require('../models/Tenant');

// @desc Get all rooms
// @route GET /api/rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({}).populate('occupants', 'name email');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get available rooms
// @route GET /api/rooms/available
exports.getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Allocate room to tenant
// @route POST /api/rooms/allocate
exports.allocateRoom = async (req, res) => {
  try {
    const { tenantId, roomId } = req.body;
    
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ message: 'Room is at full capacity' });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // Remove tenant from old room if any
    if (tenant.roomId) {
      const oldRoom = await Room.findById(tenant.roomId);
      if (oldRoom) {
        oldRoom.occupants = oldRoom.occupants.filter(id => id.toString() !== tenantId);
        oldRoom.isAvailable = true;
        await oldRoom.save();
      }
    }

    // Add to new room
    room.occupants.push(tenantId);
    if (room.occupants.length === room.capacity) {
      room.isAvailable = false;
    }
    await room.save();

    tenant.roomId = roomId;
    await tenant.save();

    res.json({ message: 'Room allocated successfully', room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
