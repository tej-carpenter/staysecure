const mongoose = require('mongoose');
const path = require('path');

const Booking = require('./src/models/Booking');
const User = require('./src/models/User');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/stay-secure', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find all users with RECEPTIONIST role
    const receptionists = await User.find({ role: 'RECEPTIONIST' });
    console.log('\n=== RECEPTIONISTS ===');
    console.log(`Found ${receptionists.length} receptionists`);
    receptionists.forEach(r => {
      console.log(`  - ${r.name} (${r.email})`);
    });

    // Find all bookings with CONFIRMED status
    const confirmedBookings = await Booking.find({ bookingStatus: 'CONFIRMED' })
      .populate('user', 'name email phone')
      .populate('roomType', 'name')
      .limit(5);
    console.log('\n=== CONFIRMED BOOKINGS (Ready for Check-In) ===');
    console.log(`Found ${confirmedBookings.length} confirmed bookings`);
    confirmedBookings.forEach(b => {
      console.log(`  - BK${b.bookingNumber}: ${b.user?.name} (${b.roomType?.name})`);
    });

    // Find all bookings with CHECKED_IN status
    const checkedInBookings = await Booking.find({ bookingStatus: 'CHECKED_IN' })
      .populate('user', 'name email phone')
      .populate('roomType', 'name')
      .limit(5);
    console.log('\n=== CHECKED_IN BOOKINGS (Ready for Check-Out) ===');
    console.log(`Found ${checkedInBookings.length} checked-in bookings`);
    checkedInBookings.forEach(b => {
      console.log(`  - BK${b.bookingNumber}: ${b.user?.name} (${b.roomType?.name})`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

connectDB();
