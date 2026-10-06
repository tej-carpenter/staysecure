require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const Location = require('./models/Location');
const Property = require('./models/Property');
const Room = require('./models/Room');
const RoomType = require('./models/RoomType');
const User = require('./models/User');

const inferPropertyType = (roomTypes) => {
  const names = roomTypes.map((roomType) => String(roomType.name || '').toUpperCase());
  if (names.some((name) => name.includes('PG'))) return 'PG';
  if (names.some((name) => name.includes('HOSTEL') || name.includes('DORM'))) return 'HOSTEL';
  if (names.some((name) => name.includes('GUEST'))) return 'GUEST_HOUSE';
  return 'HOTEL';
};

const migrateProperties = async () => {
  let exitCode = 0;

  try {
    await connectDB();

    let location = await Location.findOne();
    if (!location) {
      location = await Location.create({
        name: 'StaySecure Central',
        address: 'Main Street',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560001',
      });
      console.log('Created default location.');
    }

    let property = await Property.findOne();
    if (!property) {
      const manager = await User.findOne({ role: 'HOTEL_MANAGER' });
      const roomTypes = await RoomType.find();
      property = await Property.create({
        name: 'StaySecure Central',
        type: inferPropertyType(roomTypes),
        location: location._id,
        manager: manager?._id,
        approvalMode: 'MANUAL',
        isActive: true,
      });
      console.log(`Created default property: ${property.name}`);
    }

    const [roomTypeResult, roomResult] = await Promise.all([
      RoomType.updateMany(
        { $or: [{ property: { $exists: false } }, { property: null }] },
        { $set: { property: property._id } }
      ),
      Room.updateMany(
        { $or: [{ property: { $exists: false } }, { property: null }] },
        { $set: { property: property._id } }
      ),
    ]);

    console.log(`Updated ${roomTypeResult.modifiedCount} room types.`);
    console.log(`Updated ${roomResult.modifiedCount} rooms.`);
    console.log('Property migration complete.');
  } catch (error) {
    console.error('Property migration failed:', error.message);
    exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
    process.exit(exitCode);
  }
};

migrateProperties();
