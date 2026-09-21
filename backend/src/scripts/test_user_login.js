const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = require('../app');

async function testUserLogin() {
  console.log('📡 Testing User Login against Atlas DB (vehicomp)...');

  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('✅ Connected to Atlas database:', mongoose.connection.name);

  // Query database directly to see users
  const dbUser = await mongoose.connection.db.collection('users').findOne({ email: 'john@example.com' });
  console.log('👤 Found user in Atlas vehicomp DB:', dbUser ? dbUser.email : 'Not found');

  if (dbUser) {
    console.log('  ID:', dbUser._id);
    console.log('  Role:', dbUser.role);
    console.log('  Password Hash:', dbUser.password);
  }

  await mongoose.disconnect();
  process.exit(0);
}

testUserLogin();
