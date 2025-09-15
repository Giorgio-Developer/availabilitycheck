const request = require('supertest');
const express = require('express');
const path = require('path');

// Setup mock instances
const mockGoogleCalendarInstance = {
  authorize: jest.fn(),
  loadCredentials: jest.fn(),
  generateAuthUrl: jest.fn(),
  getAccessToken: jest.fn(),
  listEvents: jest.fn()
};

const mockFs = {
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
};

// Mock dependencies BEFORE requiring the route
jest.mock('../../GoogleCalendar', () => {
  return jest.fn().mockImplementation(() => mockGoogleCalendarInstance);
});

// Create a complete filesystem mock for Express sendFile
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    existsSync: jest.fn(),
    stat: jest.fn((path, callback) => {
      // Mock successful file stat for HTML files
      callback(null, {
        isFile: () => true,
        isDirectory: () => false,
        size: 1000,
        mtime: new Date('2024-01-01'),
        birthtime: new Date('2024-01-01')
      });
    }),
    createReadStream: jest.fn(() => {
      const { Readable } = require('stream');
      const mockStream = new Readable({
        read() {
          this.push('<html><body>Mock HTML content</body></html>');
          this.push(null);
        }
      });
      return mockStream;
    }),
    readFileSync: jest.fn(() => '<html><body>Mock HTML</body></html>'),
    writeFileSync: jest.fn()
  };
});

// Mock path functions
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
  dirname: jest.fn(() => '/mock/dir'),
  basename: jest.fn(() => 'file.html'),
  extname: jest.fn(() => '.html')
}));

const calendarRoutes = require('../../routes/calendar');
const GoogleCalendar = require('../../GoogleCalendar');
const fs = require('fs');

describe('Calendar Routes Integration', () => {
  let app;
  let mockGoogleCalendar;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Mock res.sendFile before adding routes
    app.use((req, res, next) => {
      const originalSendFile = res.sendFile;
      res.sendFile = jest.fn((filePath, options, callback) => {
        // Simulate successful file sending
        if (filePath.includes('disponibilita.html')) {
          res.status(200).send('<html><body>Disponibilita Page</body></html>');
        } else {
          res.status(200).send('<html><body>Index Page</body></html>');
        }
      });
      next();
    });

    app.use('/', calendarRoutes);

    // Reset mocks
    jest.clearAllMocks();

    // Use the global mock instances
    mockGoogleCalendar = mockGoogleCalendarInstance;
  });

  describe('GET /', () => {
    test('should call authorize and handle valid token', async () => {
      const mockOAuth2Client = {
        credentials: { access_token: 'valid_token' }
      };
      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);

      const response = await request(app).get('/');

      expect(mockGoogleCalendar.authorize).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.text).toContain('Disponibilita Page');
    });

    test('should serve index.html when token is invalid', async () => {
      const mockOAuth2Client = {
        credentials: {}
      };
      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);

      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Index Page');
      expect(mockGoogleCalendar.authorize).toHaveBeenCalled();
    });

    test('should serve index.html when authorization fails', async () => {
      mockGoogleCalendar.authorize.mockRejectedValue(new Error('Auth failed'));

      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Index Page');
      expect(mockGoogleCalendar.authorize).toHaveBeenCalled();
    });
  });

  describe('GET /check-token', () => {
    test('should return hasToken: true when token file exists', async () => {
      fs.existsSync.mockReturnValue(true);

      const response = await request(app).get('/check-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ hasToken: true });
      expect(fs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining('token.json')
      );
    });

    test('should return hasToken: false when token file does not exist', async () => {
      fs.existsSync.mockReturnValue(false);

      const response = await request(app).get('/check-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ hasToken: false });
    });

    test('should handle errors gracefully', async () => {
      fs.existsSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      const response = await request(app).get('/check-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error checking token' });
    });
  });

  describe('GET /auth-url', () => {
    test('should return authorization URL successfully', async () => {
      const mockAuthUrl = 'https://accounts.google.com/oauth/authorize?...';
      mockGoogleCalendar.loadCredentials.mockResolvedValue();
      mockGoogleCalendar.generateAuthUrl.mockReturnValue(mockAuthUrl);

      const response = await request(app).get('/auth-url');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ url: mockAuthUrl });
      expect(mockGoogleCalendar.loadCredentials).toHaveBeenCalled();
      expect(mockGoogleCalendar.generateAuthUrl).toHaveBeenCalled();
    });

    test('should handle credential loading errors', async () => {
      mockGoogleCalendar.loadCredentials.mockRejectedValue(new Error('Credentials error'));

      const response = await request(app).get('/auth-url');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error generating auth URL');
    });

    test('should handle auth URL generation errors', async () => {
      mockGoogleCalendar.loadCredentials.mockResolvedValue();
      mockGoogleCalendar.generateAuthUrl.mockImplementation(() => {
        throw new Error('Auth URL error');
      });

      const response = await request(app).get('/auth-url');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error generating auth URL');
    });
  });

  describe('GET /oauth2callback', () => {
    test('should handle OAuth2 callback successfully', async () => {
      const mockCode = 'auth_code_123';
      const mockOAuth2Client = { credentials: { access_token: 'token' } };

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);
      mockGoogleCalendar.getAccessToken.mockResolvedValue(mockOAuth2Client);

      const response = await request(app)
        .get('/oauth2callback')
        .query({ code: mockCode });

      expect(response.status).toBe(200);
      expect(mockGoogleCalendar.authorize).toHaveBeenCalled();
      expect(mockGoogleCalendar.getAccessToken).toHaveBeenCalledWith(
        mockOAuth2Client,
        mockCode
      );
    });

    test('should handle missing authorization code', async () => {
      const mockOAuth2Client = { credentials: {} };
      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);
      // getAccessToken should fail when code is undefined
      mockGoogleCalendar.getAccessToken.mockRejectedValue(new Error('Missing code'));

      const response = await request(app).get('/oauth2callback');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error during OAuth2 callback');
    });

    test('should handle OAuth2 errors', async () => {
      const mockCode = 'invalid_code';
      const mockOAuth2Client = { credentials: {} };

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);
      mockGoogleCalendar.getAccessToken.mockRejectedValue(new Error('Invalid code'));

      const response = await request(app)
        .get('/oauth2callback')
        .query({ code: mockCode });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error during OAuth2 callback');
    });
  });

  describe('POST /events', () => {
    test('should list events for multiple calendars successfully', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };
      const mockEvents1 = [
        { id: '1', summary: 'Event 1', start: { dateTime: '2024-01-01T10:00:00Z' } }
      ];
      const mockEvents2 = [
        { id: '2', summary: 'Event 2', start: { dateTime: '2024-01-02T10:00:00Z' } }
      ];

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);
      mockGoogleCalendar.listEvents
        .mockResolvedValueOnce(mockEvents1)
        .mockResolvedValueOnce(mockEvents2);

      const response = await request(app)
        .post('/events')
        .send({
          calendarIds: ['calendar1@google.com', 'calendar2@google.com'],
          timeMin: '2024-01-01T00:00:00Z',
          timeMax: '2024-01-02T23:59:59Z'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([...mockEvents1, ...mockEvents2]);
      expect(mockGoogleCalendar.listEvents).toHaveBeenCalledTimes(2);
    });

    test('should handle single calendar ID', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };
      const mockEvents = [
        { id: '1', summary: 'Event 1', start: { dateTime: '2024-01-01T10:00:00Z' } }
      ];

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);
      mockGoogleCalendar.listEvents.mockResolvedValue(mockEvents);

      const response = await request(app)
        .post('/events')
        .send({
          calendarIds: ['calendar1@google.com'],
          timeMin: '2024-01-01T00:00:00Z',
          timeMax: '2024-01-02T23:59:59Z'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockEvents);
      expect(mockGoogleCalendar.listEvents).toHaveBeenCalledWith(
        mockOAuth2Client,
        'calendar1@google.com',
        '2024-01-01T00:00:00Z',
        '2024-01-02T23:59:59Z'
      );
    });

    test('should handle authorization errors', async () => {
      mockGoogleCalendar.authorize.mockRejectedValue(new Error('Auth failed'));

      const response = await request(app)
        .post('/events')
        .send({
          calendarIds: ['calendar1@google.com'],
          timeMin: '2024-01-01T00:00:00Z',
          timeMax: '2024-01-02T23:59:59Z'
        });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error listing events');
    });

    test('should handle calendar API errors', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);
      mockGoogleCalendar.listEvents.mockRejectedValue(new Error('API error'));

      const response = await request(app)
        .post('/events')
        .send({
          calendarIds: ['calendar1@google.com'],
          timeMin: '2024-01-01T00:00:00Z',
          timeMax: '2024-01-02T23:59:59Z'
        });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error listing events');
    });

    test('should handle missing required parameters', async () => {
      const response = await request(app)
        .post('/events')
        .send({
          calendarIds: ['calendar1@google.com']
          // Missing timeMin and timeMax
        });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error listing events');
    });

    test('should handle empty calendar IDs array', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);

      const response = await request(app)
        .post('/events')
        .send({
          calendarIds: [],
          timeMin: '2024-01-01T00:00:00Z',
          timeMax: '2024-01-02T23:59:59Z'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(mockGoogleCalendar.listEvents).not.toHaveBeenCalled();
    });
  });
});