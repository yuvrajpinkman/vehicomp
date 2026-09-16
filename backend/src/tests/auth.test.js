const bcrypt = require('bcryptjs');
const { signToken, verifyToken } = require('../utils/jwt');

describe('Auth Unit Tests', () => {
  it('should correctly hash and compare passwords with bcrypt', async () => {
    const rawPassword = 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
    const isWrongMatch = await bcrypt.compare('WrongPassword', hashedPassword);

    expect(isMatch).toBe(true);
    expect(isWrongMatch).toBe(false);
  });

  it('should sign and verify JWT tokens correctly', () => {
    const mockUserPayload = {
      id: '65f1a2b3c4d5e6f7a8b9c0d1',
      email: 'customer@example.com',
      role: 'CUSTOMER',
    };

    const token = signToken(mockUserPayload);
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.id).toBe(mockUserPayload.id);
    expect(decoded.email).toBe(mockUserPayload.email);
    expect(decoded.role).toBe(mockUserPayload.role);
  });
});
