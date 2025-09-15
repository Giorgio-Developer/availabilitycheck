// Google API mocks for testing

const createMockOAuth2Client = (options = {}) => ({
  credentials: options.credentials || { access_token: 'mock_token' },
  setCredentials: jest.fn(),
  generateAuthUrl: jest.fn(() => 'https://accounts.google.com/oauth/authorize?mock=true'),
  getToken: jest.fn((code, callback) => {
    if (code === 'valid_code') {
      callback(null, { access_token: 'mock_token', refresh_token: 'mock_refresh' });
    } else {
      callback(new Error('Invalid code'), null);
    }
  }),
  on: jest.fn(),
  ...options.overrides
});

const createMockCalendarApi = (options = {}) => ({
  events: {
    list: jest.fn(() => Promise.resolve({
      data: {
        items: options.events || [
          {
            id: 'mock_event_1',
            summary: 'Mock Event 1',
            start: { dateTime: '2024-01-01T10:00:00Z' },
            end: { dateTime: '2024-01-01T11:00:00Z' }
          }
        ]
      }
    }))
  },
  freebusy: {
    query: jest.fn(() => Promise.resolve({
      data: {
        calendars: options.freeBusy || {
          'calendar@example.com': { busy: [] }
        }
      }
    }))
  },
  calendarList: {
    list: jest.fn(() => Promise.resolve({
      data: {
        items: options.calendars || [
          {
            id: 'calendar@example.com',
            summary: 'Mock Calendar',
            primary: true
          }
        ]
      }
    }))
  },
  ...options.overrides
});

const createMockFreeBusyResponse = (calendarId, busyPeriods = []) => ({
  [calendarId]: {
    busy: busyPeriods.map(period => ({
      start: period.start,
      end: period.end
    }))
  }
});

const createMockEvent = (overrides = {}) => ({
  id: 'mock_event',
  summary: 'Mock Event',
  start: { dateTime: '2024-01-01T10:00:00Z' },
  end: { dateTime: '2024-01-01T11:00:00Z' },
  ...overrides
});

const createMockBusyPeriod = (start, end) => ({
  start,
  end
});

module.exports = {
  createMockOAuth2Client,
  createMockCalendarApi,
  createMockFreeBusyResponse,
  createMockEvent,
  createMockBusyPeriod
};