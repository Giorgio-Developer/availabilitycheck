// Test setup file
require('dotenv').config({ path: '.env.test' });

// Setup global test configurations
global.TEST_ENV = 'test';

// Mock external services by default
jest.mock('axios');
jest.mock('googleapis');
jest.mock('openai');

// Set default test environment variables if not present
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.SESSION_SECRET = 'test-secret';
process.env.ADMIN_EMAIL = 'test@admin.com';
process.env.ADMIN_PASSWORD = 'testpassword';
process.env.OPENAI_API_KEY = 'test-openai-key';

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});