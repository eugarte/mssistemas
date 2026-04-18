// Test setup file
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.MASTER_KEY = '01234567890123456789012345678901'; // 32 bytes for AES-256

// Global test timeout
jest.setTimeout(10000);

// Cleanup after all tests
afterAll(async () => {
  // Add any global cleanup here
});