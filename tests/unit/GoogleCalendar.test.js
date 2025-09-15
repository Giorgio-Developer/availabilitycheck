const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const GoogleCalendar = require('../../GoogleCalendar');

// Mock dependencies
jest.mock('fs');
jest.mock('googleapis');

describe('GoogleCalendar', () => {
  let googleCalendar;
  let mockOAuth2Client;
  let mockCalendar;

  beforeEach(() => {
    googleCalendar = new GoogleCalendar();

    // Mock OAuth2 client
    mockOAuth2Client = {
      setCredentials: jest.fn(),
      generateAuthUrl: jest.fn(),
      getToken: jest.fn(),
      on: jest.fn()
    };

    // Mock calendar API
    mockCalendar = {
      events: {
        list: jest.fn()
      },
      freebusy: {
        query: jest.fn()
      },
      calendarList: {
        list: jest.fn()
      }
    };

    // Setup google mocks
    google.auth.OAuth2 = jest.fn(() => mockOAuth2Client);
    google.calendar = jest.fn(() => mockCalendar);

    // Mock credentials file structure
    const mockCredentials = {
      web: {
        client_id: 'test_client_id',
        client_secret: 'test_client_secret',
        redirect_uris: ['http://localhost:3000/oauth2callback']
      }
    };

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default fs mocks (after clearing)
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('credentials.json')) {
        return JSON.stringify(mockCredentials);
      }
      return '{}'; // Default for other files like token.json
    });
  });

  describe('constructor', () => {
    test('should initialize with correct properties', () => {
      expect(googleCalendar.SCOPES).toEqual(['https://www.googleapis.com/auth/calendar']);
      expect(googleCalendar.TOKEN_PATH).toContain('token.json');
      expect(googleCalendar.credentialsPath).toContain('credentials.json');
    });
  });

  describe('loadCredentials', () => {
    test('should load credentials from file successfully', async () => {
      const mockCredentials = {
        web: {
          client_id: 'test_client_id',
          client_secret: 'test_client_secret',
          redirect_uris: ['http://localhost:3000/oauth2callback']
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockCredentials));

      await googleCalendar.loadCredentials();

      expect(fs.readFileSync).toHaveBeenCalledWith(
        googleCalendar.credentialsPath,
        'utf8'
      );
      expect(googleCalendar.client_id).toBe('test_client_id');
      expect(googleCalendar.client_secret).toBe('test_client_secret');
      expect(googleCalendar.redirect_uris).toEqual(['http://localhost:3000/oauth2callback']);
    });

    test('should handle file read errors', async () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      await expect(googleCalendar.loadCredentials()).rejects.toThrow('File not found');
    });

    test('should handle invalid JSON', async () => {
      fs.readFileSync.mockReturnValue('invalid json');

      await expect(googleCalendar.loadCredentials()).rejects.toThrow();
    });
  });

  describe('authorize', () => {
    beforeEach(() => {
      googleCalendar.client_id = 'test_client_id';
      googleCalendar.client_secret = 'test_client_secret';
      googleCalendar.redirect_uris = ['http://localhost:3000/oauth2callback'];
    });

    test('should authorize with existing token', async () => {
      const mockToken = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token'
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('credentials.json')) {
          return JSON.stringify({
            web: {
              client_id: 'test_client_id',
              client_secret: 'test_client_secret',
              redirect_uris: ['http://localhost:3000/oauth2callback']
            }
          });
        }
        if (filePath.includes('token.json')) {
          return JSON.stringify(mockToken);
        }
        return '{}';
      });

      const result = await googleCalendar.authorize();

      expect(fs.existsSync).toHaveBeenCalledWith(googleCalendar.TOKEN_PATH);
      expect(fs.readFileSync).toHaveBeenCalledWith(googleCalendar.TOKEN_PATH, 'utf8');
      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith(mockToken);
      expect(mockOAuth2Client.on).toHaveBeenCalledWith('tokens', expect.any(Function));
      expect(result).toBe(mockOAuth2Client);
    });

    test('should handle missing token file', async () => {
      fs.existsSync.mockReturnValue(false);

      const result = await googleCalendar.authorize();

      expect(fs.existsSync).toHaveBeenCalledWith(googleCalendar.TOKEN_PATH);
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('credentials.json'), 'utf8');
      expect(fs.readFileSync).not.toHaveBeenCalledWith(expect.stringContaining('token.json'), 'utf8');
      expect(result).toBe(mockOAuth2Client);
    });

    test('should handle token refresh', async () => {
      const mockToken = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token'
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('credentials.json')) {
          return JSON.stringify({
            web: {
              client_id: 'test_client_id',
              client_secret: 'test_client_secret',
              redirect_uris: ['http://localhost:3000/oauth2callback']
            }
          });
        }
        if (filePath.includes('token.json')) {
          return JSON.stringify(mockToken);
        }
        return '{}';
      });
      fs.writeFileSync.mockImplementation(() => {});

      await googleCalendar.authorize();

      // Simulate token refresh event
      const tokenHandler = mockOAuth2Client.on.mock.calls.find(
        call => call[0] === 'tokens'
      )[1];

      const newTokens = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token'
      };

      tokenHandler(newTokens);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        googleCalendar.TOKEN_PATH,
        JSON.stringify(newTokens)
      );
    });

    test('should handle token refresh without refresh_token', async () => {
      const mockToken = { access_token: 'test_access_token' };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('credentials.json')) {
          return JSON.stringify({
            web: {
              client_id: 'test_client_id',
              client_secret: 'test_client_secret',
              redirect_uris: ['http://localhost:3000/oauth2callback']
            }
          });
        }
        if (filePath.includes('token.json')) {
          return JSON.stringify(mockToken);
        }
        return '{}';
      });

      await googleCalendar.authorize();

      // Simulate token refresh event without refresh_token
      const tokenHandler = mockOAuth2Client.on.mock.calls.find(
        call => call[0] === 'tokens'
      )[1];

      const newTokens = { access_token: 'new_access_token' };

      tokenHandler(newTokens);

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('generateAuthUrl', () => {
    test('should generate authorization URL', () => {
      const mockAuthUrl = 'https://accounts.google.com/oauth/authorize?...';

      googleCalendar.loadCredentials = jest.fn(() => {
        googleCalendar.client_id = 'test_client_id';
        googleCalendar.client_secret = 'test_client_secret';
        googleCalendar.redirect_uris = ['http://localhost:3000/oauth2callback'];
      });
      mockOAuth2Client.generateAuthUrl.mockReturnValue(mockAuthUrl);

      const result = googleCalendar.generateAuthUrl();

      expect(googleCalendar.loadCredentials).toHaveBeenCalled();
      expect(google.auth.OAuth2).toHaveBeenCalledWith(
        googleCalendar.client_id,
        googleCalendar.client_secret,
        googleCalendar.redirect_uris[0]
      );
      expect(mockOAuth2Client.generateAuthUrl).toHaveBeenCalledWith({
        access_type: 'offline',
        scope: googleCalendar.SCOPES,
        prompt: 'select_account'
      });
      expect(result).toBe(mockAuthUrl);
    });
  });

  describe('getAccessToken', () => {
    test('should get access token successfully', async () => {
      const mockCode = 'auth_code_123';
      const mockToken = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token'
      };

      fs.writeFileSync.mockImplementation(() => {});
      mockOAuth2Client.getToken.mockImplementation((code, callback) => {
        callback(null, mockToken);
      });

      const result = await googleCalendar.getAccessToken(mockOAuth2Client, mockCode);

      expect(mockOAuth2Client.getToken).toHaveBeenCalledWith(mockCode, expect.any(Function));
      expect(mockOAuth2Client.setCredentials).toHaveBeenCalledWith(mockToken);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        googleCalendar.TOKEN_PATH,
        JSON.stringify(mockToken)
      );
      expect(result).toBe(mockOAuth2Client);
    });

    test('should handle token retrieval errors', async () => {
      const mockCode = 'invalid_code';
      const mockError = new Error('Invalid authorization code');

      mockOAuth2Client.getToken.mockImplementation((code, callback) => {
        callback(mockError, null);
      });

      await expect(
        googleCalendar.getAccessToken(mockOAuth2Client, mockCode)
      ).rejects.toThrow('Invalid authorization code');

      expect(mockOAuth2Client.setCredentials).not.toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('listEvents', () => {
    test('should list events successfully', async () => {
      const mockEvents = [
        {
          id: 'event1',
          summary: 'Test Event 1',
          start: { dateTime: '2024-01-01T10:00:00Z' },
          end: { dateTime: '2024-01-01T11:00:00Z' }
        },
        {
          id: 'event2',
          summary: 'Test Event 2',
          start: { dateTime: '2024-01-02T10:00:00Z' },
          end: { dateTime: '2024-01-02T11:00:00Z' }
        }
      ];

      mockCalendar.events.list.mockResolvedValue({
        data: { items: mockEvents }
      });

      const result = await googleCalendar.listEvents(
        mockOAuth2Client,
        'calendar@example.com',
        '2024-01-01',
        '2024-01-02'
      );

      expect(google.calendar).toHaveBeenCalledWith({
        version: 'v3',
        auth: mockOAuth2Client
      });
      expect(mockCalendar.events.list).toHaveBeenCalledWith({
        calendarId: 'calendar@example.com',
        timeMin: '2024-01-01T00:00:00.000Z',
        timeMax: '2024-01-02T00:00:00.000Z',
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      });
      expect(result).toEqual(mockEvents);
    });

    test('should handle API errors', async () => {
      mockCalendar.events.list.mockRejectedValue(new Error('Calendar API error'));

      await expect(
        googleCalendar.listEvents(
          mockOAuth2Client,
          'calendar@example.com',
          '2024-01-01',
          '2024-01-02'
        )
      ).rejects.toThrow('Calendar API error');
    });

    test('should handle date conversion correctly', async () => {
      mockCalendar.events.list.mockResolvedValue({
        data: { items: [] }
      });

      await googleCalendar.listEvents(
        mockOAuth2Client,
        'calendar@example.com',
        '2024-01-01T10:00:00Z',
        '2024-01-02T10:00:00Z'
      );

      expect(mockCalendar.events.list).toHaveBeenCalledWith(
        expect.objectContaining({
          timeMin: '2024-01-01T10:00:00.000Z',
          timeMax: '2024-01-02T10:00:00.000Z'
        })
      );
    });
  });

  describe('checkFreeBusy', () => {
    test('should check free/busy status successfully', async () => {
      const mockRequestBody = {
        timeMin: '2024-01-01T00:00:00Z',
        timeMax: '2024-01-02T00:00:00Z',
        items: [
          { id: 'calendar1@example.com' },
          { id: 'calendar2@example.com' }
        ]
      };

      const mockFreeBusyResponse = {
        'calendar1@example.com': {
          busy: [
            {
              start: '2024-01-01T10:00:00Z',
              end: '2024-01-01T11:00:00Z'
            }
          ]
        },
        'calendar2@example.com': {
          busy: []
        }
      };

      mockCalendar.freebusy.query.mockResolvedValue({
        data: { calendars: mockFreeBusyResponse }
      });

      const result = await googleCalendar.checkFreeBusy(mockOAuth2Client, mockRequestBody);

      expect(google.calendar).toHaveBeenCalledWith({
        version: 'v3',
        auth: mockOAuth2Client
      });
      expect(mockCalendar.freebusy.query).toHaveBeenCalledWith({
        requestBody: mockRequestBody
      });
      expect(result).toEqual(mockFreeBusyResponse);
    });

    test('should handle free/busy API errors', async () => {
      const mockRequestBody = {
        timeMin: '2024-01-01T00:00:00Z',
        timeMax: '2024-01-02T00:00:00Z',
        items: [{ id: 'calendar@example.com' }]
      };

      mockCalendar.freebusy.query.mockRejectedValue(new Error('FreeBusy API error'));

      await expect(
        googleCalendar.checkFreeBusy(mockOAuth2Client, mockRequestBody)
      ).rejects.toThrow('FreeBusy API error');
    });
  });

  describe('listCalendars', () => {
    test('should list calendars successfully', async () => {
      const mockCalendars = [
        {
          id: 'calendar1@example.com',
          summary: 'Calendar 1',
          primary: true
        },
        {
          id: 'calendar2@example.com',
          summary: 'Calendar 2',
          primary: false
        }
      ];

      mockCalendar.calendarList.list.mockResolvedValue({
        data: { items: mockCalendars }
      });

      const result = await googleCalendar.listCalendars(mockOAuth2Client);

      expect(google.calendar).toHaveBeenCalledWith({
        version: 'v3',
        auth: mockOAuth2Client
      });
      expect(mockCalendar.calendarList.list).toHaveBeenCalled();
      expect(result).toEqual(mockCalendars);
    });

    test('should handle calendar list API errors', async () => {
      mockCalendar.calendarList.list.mockRejectedValue(new Error('Calendar list API error'));

      await expect(
        googleCalendar.listCalendars(mockOAuth2Client)
      ).rejects.toThrow('Calendar list API error');
    });
  });

  describe('file system operations', () => {
    test('should handle file system errors gracefully', async () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      await expect(googleCalendar.loadCredentials()).rejects.toThrow('File system error');
    });

    test('should handle write errors during token save', async () => {
      const mockToken = { access_token: 'test_token' };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('credentials.json')) {
          return JSON.stringify({
            web: {
              client_id: 'test_client_id',
              client_secret: 'test_client_secret',
              redirect_uris: ['http://localhost:3000/oauth2callback']
            }
          });
        }
        if (filePath.includes('token.json')) {
          return JSON.stringify(mockToken);
        }
        return '{}';
      });
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Write error');
      });

      // This should not throw, as the error is caught in the token handler
      await googleCalendar.authorize();

      const tokenHandler = mockOAuth2Client.on.mock.calls.find(
        call => call[0] === 'tokens'
      )[1];

      const newTokens = { access_token: 'new_token', refresh_token: 'refresh' };

      // File write error should be thrown since there's no error handling
      expect(() => tokenHandler(newTokens)).toThrow('Write error');
    });
  });

  describe('integration scenarios', () => {
    test('should handle complete OAuth flow', async () => {
      // Setup mocks for complete flow
      const mockCredentials = {
        web: {
          client_id: 'test_client_id',
          client_secret: 'test_client_secret',
          redirect_uris: ['http://localhost:3000/oauth2callback']
        }
      };

      const mockAuthUrl = 'https://accounts.google.com/oauth/authorize?...';
      const mockCode = 'auth_code_123';
      const mockToken = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token'
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockCredentials));
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync.mockImplementation(() => {});
      mockOAuth2Client.generateAuthUrl.mockReturnValue(mockAuthUrl);
      mockOAuth2Client.getToken.mockImplementation((code, callback) => {
        callback(null, mockToken);
      });

      // Step 1: Load credentials
      await googleCalendar.loadCredentials();

      // Step 2: Generate auth URL
      const authUrl = googleCalendar.generateAuthUrl();

      // Step 3: Authorize (no existing token)
      const oAuth2Client = await googleCalendar.authorize();

      // Step 4: Get access token
      const authorizedClient = await googleCalendar.getAccessToken(oAuth2Client, mockCode);

      expect(authUrl).toBe(mockAuthUrl);
      expect(authorizedClient).toBe(mockOAuth2Client);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        googleCalendar.TOKEN_PATH,
        JSON.stringify(mockToken)
      );
    });
  });
});