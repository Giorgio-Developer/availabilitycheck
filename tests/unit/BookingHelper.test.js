const fs = require('fs');
const BookingHelper = require('../../BookingHelper');

// Mock fs module and csv parser
jest.mock('fs');

describe('BookingHelper', () => {
  const mockBookings = [
    { 'data inizio': '01/01/24', 'data fine': '05/01/24', 'costo': '100,00' },
    { 'data inizio': '06/01/24', 'data fine': '10/01/24', 'costo': '120.50' },
    { 'data inizio': '11/01/24', 'data fine': '15/01/24', 'costo': '110' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readCSV', () => {
    test('should read CSV file successfully', async () => {
      // Mock createReadStream
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            setTimeout(() => {
              mockBookings.forEach(booking => callback(booking));
            }, 0);
          } else if (event === 'end') {
            setTimeout(callback, 0);
          }
          return mockStream;
        })
      };

      fs.createReadStream.mockReturnValue(mockStream);

      const result = await BookingHelper.readCSV('test.csv');

      expect(fs.createReadStream).toHaveBeenCalledWith('test.csv');
      expect(result).toEqual(mockBookings);
    });

    test('should handle file read errors', async () => {
      const mockError = new Error('File not found');

      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(mockError), 0);
          }
          return mockStream;
        })
      };

      fs.createReadStream.mockReturnValue(mockStream);

      await expect(BookingHelper.readCSV('nonexistent.csv')).rejects.toThrow('File not found');
    });

    test('should return empty array for empty CSV', async () => {
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'end') {
            setTimeout(callback, 0);
          }
          return mockStream;
        })
      };

      fs.createReadStream.mockReturnValue(mockStream);

      const result = await BookingHelper.readCSV('empty.csv');
      expect(result).toEqual([]);
    });
  });

  describe('calculateTotalCostV2', () => {
    test('should calculate total cost for single night stay with 2 adults', () => {
      const bookings = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100.00' }
      ];

      const result = BookingHelper.calculateTotalCostV2(
        bookings,
        '2024-01-01',
        '2024-01-02', // Single night
        2, // adults
        0, // children
        'no' // pets
      );

      // Expected: 100.00 (room) + 25 (cleaning) = 125.00
      expect(result).toBe('125.00');
    });

    test('should calculate total cost for multiple nights', () => {
      const bookings = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100.00' }
      ];

      const result = BookingHelper.calculateTotalCostV2(
        bookings,
        '2024-01-01',
        '2024-01-04', // 3 nights
        2, // adults
        0, // children
        'no' // pets
      );

      // Expected: 100.00 * 3 nights + 25 (cleaning) = 325.00
      expect(result).toBe('325.00');
    });

    test('should add extra cost for more than 2 adults', () => {
      const bookings = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100.00' }
      ];

      const result = BookingHelper.calculateTotalCostV2(
        bookings,
        '2024-01-01',
        '2024-01-02', // Single night
        4, // adults (2 extra)
        0, // children
        'no' // pets
      );

      // Expected: 100.00 (room) + 50*2 (extra adults) + 25 (cleaning) = 225.00
      expect(result).toBe('225.00');
    });

    test('should add pet cost when pets are included', () => {
      const bookings = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100.00' }
      ];

      const result = BookingHelper.calculateTotalCostV2(
        bookings,
        '2024-01-01',
        '2024-01-02', // Single night
        2, // adults
        0, // children
        'si' // pets
      );

      // Expected: 100.00 (room) + 15 (pet) + 25 (cleaning) = 140.00
      expect(result).toBe('140.00');
    });

    test('should handle different pet values correctly', () => {
      const bookings = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100.00' }
      ];

      const testCases = [
        { pets: 'Si', expected: '140.00' },
        { pets: 'yes', expected: '140.00' },
        { pets: 'Yes', expected: '140.00' },
        { pets: 'no', expected: '125.00' },
        { pets: 'No', expected: '125.00' }
      ];

      testCases.forEach(({ pets, expected }) => {
        const result = BookingHelper.calculateTotalCostV2(
          bookings,
          '2024-01-01',
          '2024-01-02',
          2, 0, pets
        );
        expect(result).toBe(expected);
      });
    });

    test('should handle comma decimal separator in cost', () => {
      const bookings = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100,50' }
      ];

      const result = BookingHelper.calculateTotalCostV2(
        bookings,
        '2024-01-01',
        '2024-01-02',
        2, 0, 'no'
      );

      // Expected: 100.50 (room) + 25 (cleaning) = 125.50
      expect(result).toBe('125.50');
    });

    test('should handle different date formats', () => {
      const bookings = [
        { 'data inizio': '01/01/24', 'data fine': '05/01/24', 'costo': '100.00' }
      ];

      const result = BookingHelper.calculateTotalCostV2(
        bookings,
        '2024-01-01',
        '2024-01-02',
        2, 0, 'no'
      );

      expect(result).toBe('125.00');
    });

    test('should return error when booking not found for date', () => {
      const bookings = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100.00' }
      ];

      const result = BookingHelper.calculateTotalCostV2(
        bookings,
        '2024-01-10', // Date not covered by bookings
        '2024-01-11',
        2, 0, 'no'
      );

      expect(result).toBe('Error in cost calculation');
    });

    test('should handle overlapping date ranges correctly', () => {
      const bookings = [
        { 'data inizio': '01/01/2024', 'data fine': '10/01/2024', 'costo': '100.00' },
        { 'data inizio': '11/01/2024', 'data fine': '20/01/2024', 'costo': '120.00' }
      ];

      const result = BookingHelper.calculateTotalCostV2(
        bookings,
        '2024-01-09',
        '2024-01-13', // Spans across two bookings
        2, 0, 'no'
      );

      // Expected: 100*2 (Jan 9,10) + 120*2 (Jan 11,12) + 25 (cleaning) = 465.00
      expect(result).toBe('465.00');
    });

    test('should exclude checkout date from calculation', () => {
      const bookings = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100.00' }
      ];

      const result1 = BookingHelper.calculateTotalCostV2(
        bookings,
        '2024-01-01',
        '2024-01-02',
        2, 0, 'no'
      );

      const result2 = BookingHelper.calculateTotalCostV2(
        bookings,
        '2024-01-01',
        '2024-01-03',
        2, 0, 'no'
      );

      expect(result1).toBe('125.00'); // 1 night
      expect(result2).toBe('225.00'); // 2 nights
    });

    test('should handle complex scenario with all extras', () => {
      const bookings = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100,50' }
      ];

      const result = BookingHelper.calculateTotalCostV2(
        bookings,
        '2024-01-01',
        '2024-01-04', // 3 nights
        5, // 3 extra adults
        2, // children (not affecting cost currently)
        'Si' // pets
      );

      // Expected: 100.50*3 (room) + 50*3*3 (extra adults per night) + 15 (pet) + 25 (cleaning) = 791.50
      expect(result).toBe('791.50');
    });
  });

  describe('calculateTotalCost (legacy method)', () => {
    test('should calculate basic total cost without extras', () => {
      const bookings = [
        { 'data inizio': '01/01/24', 'data fine': '05/01/24', 'costo': '100,00' }
      ];

      const result = BookingHelper.calculateTotalCost(
        bookings,
        '2024-01-01',
        '2024-01-03'
      );

      // Expected: 100.00 * 2 nights = 200.00
      expect(result).toBe('200.00');
    });

    test('should handle date format DD/MM/YY', () => {
      const bookings = [
        { 'data inizio': '01/01/24', 'data fine': '05/01/24', 'costo': '100.00' }
      ];

      const result = BookingHelper.calculateTotalCost(
        bookings,
        '2024-01-01',
        '2024-01-02'
      );

      expect(result).toBe('100.00');
    });

    test('should return 0 for checkout-only calculation', () => {
      const bookings = [
        { 'data inizio': '01/01/24', 'data fine': '05/01/24', 'costo': '100.00' }
      ];

      const result = BookingHelper.calculateTotalCost(
        bookings,
        '2024-01-01',
        '2024-01-01' // Same date (no nights)
      );

      expect(result).toBe('0.00');
    });
  });
});