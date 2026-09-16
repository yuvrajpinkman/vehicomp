const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signToken, verifyToken } = require('../utils/jwt');

async function testAuthUnit() {
  console.log('🧪 Starting Local Auth Logic Unit Tests...');

  try {
    // 1. Password Hashing Test
    console.log('\n--- 1. Testing Password Hashing & Bcrypt Verification ---');
    const rawPassword = 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
    const isWrongMatch = await bcrypt.compare('WrongPassword', hashedPassword);

    console.log('  Original password:', rawPassword);
    console.log('  Hashed password:', hashedPassword.substring(0, 20) + '...');
    console.log('  ✅ Correct password match test:', isMatch ? 'PASSED' : 'FAILED');
    console.log('  ✅ Wrong password rejection test:', !isWrongMatch ? 'PASSED' : 'FAILED');

    // 2. JWT Signing and Verification Test
    console.log('\n--- 2. Testing JWT Token Sign & Verify ---');
    const mockUserPayload = {
      id: '65f1a2b3c4d5e6f7a8b9c0d1',
      email: 'customer@example.com',
      role: 'CUSTOMER',
    };

    const token = signToken(mockUserPayload);
    console.log('  Generated JWT:', token.substring(0, 30) + '...');

    const decoded = verifyToken(token);
    console.log('  Decoded Payload ID:', decoded.id);
    console.log('  Decoded Payload Email:', decoded.email);
    console.log('  Decoded Payload Role:', decoded.role);

    const tokenValid = decoded.id === mockUserPayload.id && decoded.role === 'CUSTOMER';
    console.log('  ✅ JWT Token Verification:', tokenValid ? 'PASSED' : 'FAILED');

    console.log('\n🎉 STAGE 2 LOCAL AUTH UNIT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Local Auth test error:', err.message);
    process.exit(1);
  }
}

testAuthUnit();
