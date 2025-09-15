const request = require('supertest');
const express = require('express');

// Setup mock for GoogleCalendar
const mockGoogleCalendarInstance = {
  authorize: jest.fn(),
  checkFreeBusy: jest.fn()
};

// Mock dependencies BEFORE requiring the route
jest.mock('../../GoogleCalendar', () => {
  return jest.fn().mockImplementation(() => mockGoogleCalendarInstance);
});
jest.mock('../../BookingHelper');
jest.mock('../../utils/dateUtils');
jest.mock('../../utils/translate');
jest.mock('../../utils/constants');

const freebusyRoutes = require('../../routes/freebusy');
const GoogleCalendar = require('../../GoogleCalendar');
const BookingHelper = require('../../BookingHelper');

describe('Freebusy Routes Integration', () => {
  let app;
  let mockGoogleCalendar;

  // Helper function to create mock freeBusy response for all room calendars
  const createMockFreeBusyResponse = (busyRooms = []) => {
    const calendarsPerRoom = {
      "Calypso": [
        "1uo0g04eif8o44c4mcn8dlufim485l0l@import.calendar.google.com",
        "69ror1fdqa43q8peb2uoe9cvooaua4r8@import.calendar.google.com"
      ],
      "Hermes": [
        "htbraiua1erp01qpo1g46nsn8bsibcuq@import.calendar.google.com",
        "si9t6943hokkgrp3u4jgdrr6lmvcujcn@import.calendar.google.com"
      ],
      "Elettra": [
        "ipdt2erdd6eoriaukuae2vv0c22fsba8@import.calendar.google.com",
        "lapifn59ijeb36asa1gq0v38qkmbvh3v@import.calendar.google.com"
      ],
      "Villa Panorama": [
        "hm24qf24l1v16fqg8iv9sgbnt1s7ctm5@import.calendar.google.com",
        "tc2jt6t6bks60ki5864taeatqinb3cd4@import.calendar.google.com"
      ],
      "Demetra": [
        "ceph5hop46teenje89bt5g2pbr70td9g@import.calendar.google.com",
        "uqshafo4vjve6ce7ts5eifutaiu9uh2o@import.calendar.google.com"
      ],
      "Iris Oasis": [
        "tqscm1ioj0n52vdda1bjsvsms019tkq3@import.calendar.google.com",
        "f6jephdvk35md7hbqpcpa7nd2v7kpd4k@import.calendar.google.com"
      ]
    };

    const response = {};
    Object.values(calendarsPerRoom).flat().forEach(calendarId => {
      const busy = busyRooms.some(room => calendarsPerRoom[room].includes(calendarId))
        ? [{ start: '2024-01-03T10:00:00Z', end: '2024-01-04T10:00:00Z' }]
        : [];
      response[calendarId] = { busy };
    });
    return response;
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/', freebusyRoutes);

    // Reset mocks
    jest.clearAllMocks();

    // Use the global mock instance
    mockGoogleCalendar = mockGoogleCalendarInstance;

    // Mock translate function
    const { translateText } = require('../../utils/translate');
    translateText.mockImplementation((text, lang) => {
      if (lang === 'en') {
        const translations = {
          'Disponibilità Villa Panorama': 'Villa Panorama Availability',
          'Camere disponibili nel periodo selezionato': 'Rooms available in the selected period',
          'Costo totale per il periodo selezionato:': 'Total cost for the selected period:',
          'Richiesta prenotazione': 'Booking request'
        };
        return translations[text] || text;
      }
      return text;
    });

    // Mock constants
    const constants = require('../../utils/constants');
    constants.roomsNames = {
      "1uo0g04eif8o44c4mcn8dlufim485l0l@import.calendar.google.com": "Calypso",
      "htbraiua1erp01qpo1g46nsn8bsibcuq@import.calendar.google.com": "Hermes",
      "ipdt2erdd6eoriaukuae2vv0c22fsba8@import.calendar.google.com": "Elettra",
      "hm24qf24l1v16fqg8iv9sgbnt1s7ctm5@import.calendar.google.com": "Villa Panorama",
      "ceph5hop46teenje89bt5g2pbr70td9g@import.calendar.google.com": "Demetra",
      "tqscm1ioj0n52vdda1bjsvsms019tkq3@import.calendar.google.com": "Iris Oasis",
    };
    constants.roomImagesByName = {
      'Villa Panorama': 'villa.jpg',
      'Calypso': 'calypso.jpg',
      'Hermes': 'hermes.jpg',
      'Elettra': 'elettra.jpg',
      'Demetra': 'demetra.jpg',
      'Iris Oasis': 'iris.jpg'
    };
    constants.htmlResponsePostfix = '</body></html>';
    constants.topNavigationBarCSS = '<style></style>';
    constants.topNavBarJS = '<script></script>';
    constants.topNavigationBar = '<nav></nav>';

    // Mock date utils
    const { findNextAvailablePeriods, convertDate } = require('../../utils/dateUtils');
    findNextAvailablePeriods.mockResolvedValue([]);
    convertDate.mockImplementation(date => date.replace(/-/g, '-'));
  });

  describe('POST /freebusy', () => {
    const defaultRequestBody = {
      calendarIds: ['calendar1@google.com'],
      timeMin: '2024-01-01',
      timeMax: '2024-01-07',
      adults: 2,
      children: 0,
      pets: 'no',
      lang: 'it'
    };

    test('should return HTML response for available rooms', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };

      // Mock successful authorization
      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);

      // Mock free/busy response - all calendars are free
      mockGoogleCalendar.checkFreeBusy.mockResolvedValue(createMockFreeBusyResponse());

      // Mock BookingHelper
      BookingHelper.readCSV.mockResolvedValue([
        { 'data inizio': '01/01/2024', 'data fine': '31/12/2024', 'costo': '100.00' }
      ]);
      BookingHelper.calculateTotalCostV2.mockReturnValue('600.00');

      const response = await request(app)
        .post('/freebusy')
        .send(defaultRequestBody);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('Camere disponibili nel periodo selezionato');
      expect(mockGoogleCalendar.authorize).toHaveBeenCalled();
    });

    test('should handle future date beyond 12 months', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const futureRequestBody = {
        ...defaultRequestBody,
        timeMin: futureDate.toISOString().split('T')[0]
      };

      const response = await request(app)
        .post('/freebusy')
        .send(futureRequestBody);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('12 mesi');
    });

    test('should handle language detection from headers', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);
      mockGoogleCalendar.checkFreeBusy.mockResolvedValue(createMockFreeBusyResponse());

      const requestWithoutLang = { ...defaultRequestBody };
      delete requestWithoutLang.lang;

      const response = await request(app)
        .post('/freebusy')
        .set('Accept-Language', 'en-US,en;q=0.9')
        .send(requestWithoutLang);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });

    test('should redirect adults > 2 to specific rooms only', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);
      mockGoogleCalendar.checkFreeBusy.mockResolvedValue(createMockFreeBusyResponse());

      const requestWithManyAdults = {
        ...defaultRequestBody,
        adults: 4
      };

      const response = await request(app)
        .post('/freebusy')
        .send(requestWithManyAdults);

      expect(response.status).toBe(200);
      expect(mockGoogleCalendar.authorize).toHaveBeenCalled();
    });

    test('should handle no available rooms scenario', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);

      // Mock busy calendars
      mockGoogleCalendar.checkFreeBusy.mockResolvedValue(createMockFreeBusyResponse(['Calypso', 'Hermes', 'Elettra', 'Villa Panorama', 'Demetra', 'Iris Oasis']));

      const { findNextAvailablePeriods } = require('../../utils/dateUtils');
      findNextAvailablePeriods.mockResolvedValue([]);

      const response = await request(app)
        .post('/freebusy')
        .send(defaultRequestBody);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('non ci sono stanze disponibili');
    });

    test('should show alternative periods when no direct availability', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);

      // Mock busy calendars
      mockGoogleCalendar.checkFreeBusy.mockResolvedValue(createMockFreeBusyResponse(['Calypso', 'Hermes', 'Elettra', 'Villa Panorama', 'Demetra', 'Iris Oasis']));

      // Mock alternative periods
      const { findNextAvailablePeriods } = require('../../utils/dateUtils');
      findNextAvailablePeriods.mockResolvedValue([
        {
          start: '08-01-2024',
          end: '15-01-2024',
          totalCost: '700.00'
        }
      ]);

      const response = await request(app)
        .post('/freebusy')
        .send(defaultRequestBody);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('stanze disponibili con periodi più vicini');
    });

    test('should handle cost calculation errors', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);
      mockGoogleCalendar.checkFreeBusy.mockResolvedValue(createMockFreeBusyResponse());

      BookingHelper.readCSV.mockResolvedValue([]);
      BookingHelper.calculateTotalCostV2.mockReturnValue('Error in cost calculation');

      const response = await request(app)
        .post('/freebusy')
        .send(defaultRequestBody);

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('preventivo contattare booking@villapanoramasuite.it');
    });

    test('should handle pets parameter correctly', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);
      mockGoogleCalendar.checkFreeBusy.mockResolvedValue(createMockFreeBusyResponse());

      BookingHelper.readCSV.mockResolvedValue([
        { 'data inizio': '01/01/2024', 'data fine': '31/12/2024', 'costo': '100.00' }
      ]);
      BookingHelper.calculateTotalCostV2.mockReturnValue('615.00'); // With pet cost

      const requestWithPets = {
        ...defaultRequestBody,
        pets: 'si'
      };

      const response = await request(app)
        .post('/freebusy')
        .send(requestWithPets);

      expect(response.status).toBe(200);
      expect(BookingHelper.calculateTotalCostV2).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(String),
        expect.any(String),
        2,
        0,
        'si'
      );
    });

    test('should handle authorization errors', async () => {
      mockGoogleCalendar.authorize.mockRejectedValue(new Error('Auth failed'));

      const response = await request(app)
        .post('/freebusy')
        .send(defaultRequestBody);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error checking freeBusy');
    });

    test('should handle Google Calendar API errors', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);
      mockGoogleCalendar.checkFreeBusy.mockRejectedValue(new Error('Calendar API error'));

      const response = await request(app)
        .post('/freebusy')
        .send(defaultRequestBody);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error checking freeBusy');
    });

    test('should handle missing required parameters', async () => {
      const incompleteRequest = {
        timeMin: '2024-01-01',
        timeMax: '2024-01-07'
        // Missing calendarIds, adults, children, pets
      };

      const response = await request(app)
        .post('/freebusy')
        .send(incompleteRequest);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error checking freeBusy');
    });

    test('should handle array vs single calendar ID', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);
      mockGoogleCalendar.checkFreeBusy.mockResolvedValue(createMockFreeBusyResponse());

      const requestWithSingleId = {
        ...defaultRequestBody,
        calendarIds: 'calendar1@google.com' // String instead of array
      };

      const response = await request(app)
        .post('/freebusy')
        .send(requestWithSingleId);

      expect(response.status).toBe(200);
      expect(mockGoogleCalendar.authorize).toHaveBeenCalled();
    });

    test('should generate correct booking URLs', async () => {
      const mockOAuth2Client = { credentials: { access_token: 'token' } };

      mockGoogleCalendar.authorize.mockResolvedValue(mockOAuth2Client);
      mockGoogleCalendar.checkFreeBusy.mockResolvedValue(createMockFreeBusyResponse());

      BookingHelper.readCSV.mockResolvedValue([
        { 'data inizio': '01/01/2024', 'data fine': '31/12/2024', 'costo': '100.00' }
      ]);
      BookingHelper.calculateTotalCostV2.mockReturnValue('600.00');

      const response = await request(app)
        .post('/freebusy')
        .send(defaultRequestBody);

      expect(response.status).toBe(200);
      expect(response.text).toContain('villapanoramasuite.it/booking-engine-reservation-form');
      expect(response.text).toContain('adults=2');
      expect(response.text).toContain('children=0');
      expect(response.text).toContain('pets=No');
      expect(response.text).toContain('price=600.00');
    });
  });
});