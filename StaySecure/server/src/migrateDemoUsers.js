require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');

const demoPassword = 'TempPassword123!';

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin+demo@example.com',
    phone: '9000000001',
    role: 'ADMIN',
  },
  {
    name: 'Customer User',
    email: 'customer+demo@example.com',
    phone: '9000000002',
    role: 'CUSTOMER',
  },
  {
    name: 'Hotel Manager',
    email: 'hotelmanager+demo@example.com',
    phone: '9000000003',
    role: 'HOTEL_MANAGER',
    legacyEmails: ['roommanager+demo@example.com', 'approval+demo@example.com'],
  },
  {
    name: 'Accountant',
    email: 'accountant+demo@example.com',
    phone: '9000000005',
    role: 'ACCOUNTANT',
  },
  {
    name: 'Receptionist',
    email: 'reception+demo@example.com',
    phone: '9000000006',
    role: 'RECEPTIONIST',
  },
];

const findExistingUser = async (demoUser) => {
  const emails = [demoUser.email, ...(demoUser.legacyEmails || [])];
  return User.findOne({ email: { $in: emails } }).select('+password');
};

const upsertDemoUser = async (demoUser) => {
  const user = await findExistingUser(demoUser);
  if (user) {
    user.name = demoUser.name;
    user.email = demoUser.email;
    user.phone = demoUser.phone;
    user.role = demoUser.role;
    user.password = demoPassword;
    user.emailVerified = true;
    user.emailVerificationToken = null;
    await user.save();
    return 'updated';
  }

  await User.create({
    name: demoUser.name,
    email: demoUser.email,
    phone: demoUser.phone,
    password: demoPassword,
    role: demoUser.role,
    emailVerified: true,
    emailVerificationToken: null,
  });
  return 'created';
};

const migrateDemoUsers = async () => {
  let exitCode = 0;

  try {
    await connectDB();

    const results = { created: 0, updated: 0 };
    for (const demoUser of demoUsers) {
      const action = await upsertDemoUser(demoUser);
      results[action] += 1;
    }

    console.log(`Demo users repaired. Created: ${results.created}. Updated: ${results.updated}.`);
  } catch (error) {
    console.error('Demo user migration failed:', error.message);
    exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
    process.exit(exitCode);
  }
};

migrateDemoUsers();
