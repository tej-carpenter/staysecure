require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const RoomType = require('./models/RoomType');
const Room = require('./models/Room');
const Location = require('./models/Location');
const Settings = require('./models/Settings');
const Property = require('./models/Property');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await RoomType.deleteMany({});
    await Room.deleteMany({});
    await Location.deleteMany({});
    await Settings.deleteMany({});
    await Property.deleteMany({});

    console.log('Cleared existing data...');

    // Seed Users
    const demoPassword = 'TempPassword123!';

    const users = [
      {
        name: 'Admin User',
        email: 'admin+demo@example.com',
        phone: '9000000001',
        password: demoPassword,
        role: 'ADMIN',
        emailVerified: true,
      },
      {
        name: 'Customer User',
        email: 'customer+demo@example.com',
        phone: '9000000002',
        password: demoPassword,
        role: 'CUSTOMER',
        emailVerified: true,
      },
      {
        name: 'Hotel Manager',
        email: 'hotelmanager+demo@example.com',
        phone: '9000000003',
        password: demoPassword,
        role: 'HOTEL_MANAGER',
        emailVerified: true,
      },
      {
        name: 'Accountant',
        email: 'accountant+demo@example.com',
        phone: '9000000005',
        password: demoPassword,
        role: 'ACCOUNTANT',
        emailVerified: true,
      },
      {
        name: 'Receptionist',
        email: 'reception+demo@example.com',
        phone: '9000000006',
        password: demoPassword,
        role: 'RECEPTIONIST',
        emailVerified: true,
      },
    ];

    const createdUsers = await User.create(users);
    console.log(`✓ ${createdUsers.length} users created`);
    const hotelManager = createdUsers.find((user) => user.role === 'HOTEL_MANAGER');

    const [defaultLocation, pgLocation] = await Location.create([
      {
        name: 'StaySecure Central',
        address: 'Main Street',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560001',
      },
      {
        name: 'StaySecure North',
        address: 'Park Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560024',
      },
    ]);
    console.log('✓ Locations created');

    const properties = await Property.create([
      {
        name: 'StaySecure Central Hotel',
        type: 'HOTEL',
        location: defaultLocation._id,
        manager: hotelManager._id,
        approvalMode: 'MANUAL',
      },
      {
        name: 'StaySecure North PG',
        type: 'PG',
        location: pgLocation._id,
        manager: hotelManager._id,
        approvalMode: 'AUTOMATIC',
      },
      {
        name: 'StaySecure Campus Hostel',
        type: 'HOSTEL',
        location: defaultLocation._id,
        approvalMode: 'MANUAL',
      },
    ]);
    console.log(`✓ ${properties.length} properties created`);

    // Seed Room Types
    const roomTypes = [
      {
        property: properties[0]._id,
        name: 'Deluxe Room',
        description: 'Hotel room with private amenities',
        capacity: 2,
        pricePerDay: 1500,
        isActive: true,
      },
      {
        property: properties[0]._id,
        name: 'Guest Room',
        description: 'Simple hotel guest room',
        capacity: 2,
        pricePerDay: 900,
        isActive: true,
      },
      {
        property: properties[1]._id,
        name: 'Single Sharing',
        description: 'Private paying guest room',
        capacity: 1,
        pricePerDay: 800,
        isActive: true,
      },
      {
        property: properties[1]._id,
        name: 'Double Sharing',
        description: 'Shared paying guest room',
        capacity: 2,
        pricePerDay: 550,
        isActive: true,
      },
      {
        property: properties[2]._id,
        name: 'Dorm Bed',
        description: 'Budget-friendly shared accommodation',
        capacity: 6,
        pricePerDay: 300,
        isActive: true,
      },
      {
        property: properties[2]._id,
        name: 'Dormitory Hall',
        description: 'Large dormitory room',
        capacity: 8,
        pricePerDay: 250,
        isActive: true,
      },
    ];

    const createdRoomTypes = await RoomType.create(roomTypes);
    console.log(`✓ ${createdRoomTypes.length} room types created`);

    // Seed Rooms
    const roomsData = [
      { roomNumber: 'HT-101', property: properties[0]._id, roomType: createdRoomTypes[0]._id, location: defaultLocation._id, floor: 1, capacity: 2 },
      { roomNumber: 'HT-102', property: properties[0]._id, roomType: createdRoomTypes[0]._id, location: defaultLocation._id, floor: 1, capacity: 2 },
      { roomNumber: 'G-201', property: properties[0]._id, roomType: createdRoomTypes[1]._id, location: defaultLocation._id, floor: 2, capacity: 2 },
      { roomNumber: 'PG-101', property: properties[1]._id, roomType: createdRoomTypes[2]._id, location: pgLocation._id, floor: 1, capacity: 1 },
      { roomNumber: 'PG-102', property: properties[1]._id, roomType: createdRoomTypes[2]._id, location: pgLocation._id, floor: 1, capacity: 1 },
      { roomNumber: 'PG-201', property: properties[1]._id, roomType: createdRoomTypes[3]._id, location: pgLocation._id, floor: 2, capacity: 2 },
      { roomNumber: 'H-101', property: properties[2]._id, roomType: createdRoomTypes[4]._id, location: defaultLocation._id, floor: 1, capacity: 6 },
      { roomNumber: 'H-102', property: properties[2]._id, roomType: createdRoomTypes[4]._id, location: defaultLocation._id, floor: 1, capacity: 6 },
      { roomNumber: 'D-501', property: properties[2]._id, roomType: createdRoomTypes[5]._id, location: defaultLocation._id, floor: 5, capacity: 8 },
      { roomNumber: 'D-502', property: properties[2]._id, roomType: createdRoomTypes[5]._id, location: defaultLocation._id, floor: 5, capacity: 8 },
    ];

    const createdRooms = await Room.create(roomsData);
    console.log(`✓ ${createdRooms.length} rooms created`);

    // Seed Settings
    await Settings.create({ approvalMode: 'MANUAL' });
    console.log('✓ Settings created (approvalMode: MANUAL)');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo credentials generated for non-production testing only.');
    console.log('Use the registration flow for production-like accounts and rotate any seeded passwords immediately.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
