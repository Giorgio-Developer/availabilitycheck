// Test helper functions

const request = require('supertest');

/**
 * Helper to authenticate an admin user and return the agent
 */
const authenticateAdmin = async (app, credentials = {}) => {
  const agent = request.agent(app);

  const defaultCredentials = {
    email: process.env.ADMIN_EMAIL || 'admin@test.com',
    password: process.env.ADMIN_PASSWORD || 'testpassword'
  };

  const loginCredentials = { ...defaultCredentials, ...credentials };

  await agent
    .post('/admin/login')
    .send(loginCredentials)
    .expect(302);

  return agent;
};

/**
 * Helper to create test date ranges
 */
const createDateRange = (daysFromNow, lengthInDays) => {
  const start = new Date();
  start.setDate(start.getDate() + daysFromNow);

  const end = new Date(start);
  end.setDate(end.getDate() + lengthInDays);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

/**
 * Helper to format dates for different contexts
 */
const formatDateForContext = (date, context = 'iso') => {
  const d = new Date(date);

  switch (context) {
    case 'iso':
      return d.toISOString().split('T')[0];
    case 'dd/mm/yyyy':
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    case 'dd-mm-yyyy':
      return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
    default:
      return date;
  }
};

/**
 * Helper to create mock booking request
 */
const createBookingRequest = (overrides = {}) => {
  const defaults = {
    calendarIds: ['calendar1@example.com'],
    timeMin: '2024-01-01',
    timeMax: '2024-01-07',
    adults: 2,
    children: 0,
    pets: 'no',
    lang: 'it'
  };

  return { ...defaults, ...overrides };
};

/**
 * Helper to wait for a specified time (useful for async operations)
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to create mock CSV stream
 */
const createMockCsvStream = (data, options = {}) => {
  const mockStream = {
    pipe: jest.fn().mockReturnThis(),
    on: jest.fn((event, callback) => {
      if (event === 'data') {
        setTimeout(() => {
          data.forEach(row => callback(row));
        }, options.delay || 0);
      } else if (event === 'end') {
        setTimeout(callback, options.delay || 0);
      } else if (event === 'error' && options.error) {
        setTimeout(() => callback(options.error), options.delay || 0);
      }
      return mockStream;
    })
  };

  return mockStream;
};

/**
 * Helper to validate response HTML structure
 */
const validateHtmlResponse = (html, expectedContent = []) => {
  const checks = {
    isHtml: html.includes('<html') || html.includes('<!DOCTYPE'),
    hasBody: html.includes('<body'),
    hasHead: html.includes('<head'),
    contentChecks: expectedContent.map(content => html.includes(content))
  };

  return {
    isValid: checks.isHtml && checks.hasBody,
    ...checks
  };
};

/**
 * Helper to create test room configuration
 */
const createTestRoomConfig = (roomName, calendarIds = []) => {
  const defaultCalendars = [`${roomName.toLowerCase().replace(' ', '')}@calendar.google.com`];

  return {
    name: roomName,
    calendars: calendarIds.length > 0 ? calendarIds : defaultCalendars,
    image: `${roomName.toLowerCase().replace(' ', '_')}.jpg`
  };
};

/**
 * Helper to simulate file system operations
 */
const mockFileSystem = {
  setupReadSuccess: (fs, filePath, content) => {
    fs.existsSync.mockImplementation(path => path === filePath);
    fs.readFileSync.mockImplementation(path => {
      if (path === filePath) return content;
      throw new Error('File not found');
    });
  },

  setupReadError: (fs, filePath, error) => {
    fs.existsSync.mockImplementation(path => path === filePath);
    fs.readFileSync.mockImplementation(path => {
      if (path === filePath) throw error;
      return 'default content';
    });
  },

  setupWriteSuccess: (fs) => {
    fs.writeFileSync.mockImplementation(() => {});
    fs.writeFile.mockImplementation((path, content, callback) => {
      if (callback) callback(null);
    });
  },

  setupWriteError: (fs, error) => {
    fs.writeFileSync.mockImplementation(() => { throw error; });
    fs.writeFile.mockImplementation((path, content, callback) => {
      if (callback) callback(error);
    });
  }
};

/**
 * Helper to create test environment
 */
const setupTestEnvironment = () => {
  const originalEnv = process.env;

  process.env = {
    ...originalEnv,
    NODE_ENV: 'test',
    PORT: '3001',
    SESSION_SECRET: 'test-secret',
    ADMIN_EMAIL: 'admin@test.com',
    ADMIN_PASSWORD: 'testpassword',
    OPENAI_API_KEY: 'test-openai-key'
  };

  return () => {
    process.env = originalEnv;
  };
};

/**
 * Helper to cleanup test environment
 */
const cleanupTestEnvironment = () => {
  jest.clearAllMocks();
  jest.resetModules();
};

module.exports = {
  authenticateAdmin,
  createDateRange,
  formatDateForContext,
  createBookingRequest,
  wait,
  createMockCsvStream,
  validateHtmlResponse,
  createTestRoomConfig,
  mockFileSystem,
  setupTestEnvironment,
  cleanupTestEnvironment
};