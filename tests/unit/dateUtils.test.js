const {
  convertDateToDDMMYYYY,
  convertToDateObject,
  validateDates,
  formatDate,
  convertDate
} = require('../../utils/dateUtils');

describe('dateUtils', () => {
  describe('convertDateToDDMMYYYY', () => {
    test('should convert YYYY-MM-DD format to DD/MM/YYYY', () => {
      expect(convertDateToDDMMYYYY('2024-12-25')).toBe('25/12/2024');
      expect(convertDateToDDMMYYYY('2024-01-01')).toBe('01/01/2024');
      expect(convertDateToDDMMYYYY('2024-06-15')).toBe('15/06/2024');
    });

    test('should return original date if format is incorrect', () => {
      expect(convertDateToDDMMYYYY('invalid-date')).toBe('invalid-date');
      expect(convertDateToDDMMYYYY('2024/12/25')).toBe('2024/12/25');
      expect(convertDateToDDMMYYYY('')).toBe('');
    });
  });

  describe('convertToDateObject', () => {
    test('should convert DD/MM/YYYY format to Date object', () => {
      const result = convertToDateObject('25/12/2024');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(11); // December is month 11 in JavaScript
      expect(result.getDate()).toBe(25);
    });

    test('should handle edge cases correctly', () => {
      const result1 = convertToDateObject('01/01/2024');
      expect(result1.getFullYear()).toBe(2024);
      expect(result1.getMonth()).toBe(0); // January is month 0
      expect(result1.getDate()).toBe(1);

      const result2 = convertToDateObject('29/02/2024'); // Leap year
      expect(result2.getFullYear()).toBe(2024);
      expect(result2.getMonth()).toBe(1); // February is month 1
      expect(result2.getDate()).toBe(29);
    });
  });

  describe('validateDates', () => {
    test('should return null for valid date ranges without gaps or overlaps', () => {
      const validData = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024' },
        { 'data inizio': '06/01/2024', 'data fine': '10/01/2024' },
        { 'data inizio': '11/01/2024', 'data fine': '15/01/2024' }
      ];
      expect(validateDates(validData)).toBeNull();
    });

    test('should detect gaps between date ranges', () => {
      const dataWithGap = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024' },
        { 'data inizio': '08/01/2024', 'data fine': '10/01/2024' } // Gap between 05/01 and 08/01
      ];
      const result = validateDates(dataWithGap);
      expect(result).toContain('buchi temporali');
      expect(result).toContain('05/01/2024');
      expect(result).toContain('08/01/2024');
    });

    test('should detect overlapping date ranges', () => {
      const overlappingData = [
        { 'data inizio': '01/01/2024', 'data fine': '10/01/2024' },
        { 'data inizio': '05/01/2024', 'data fine': '15/01/2024' } // Overlap
      ];
      const result = validateDates(overlappingData);
      expect(result).toContain('sovrapposizioni');
      expect(result).toContain('10/01/2024');
      expect(result).toContain('05/01/2024');
    });

    test('should handle single date range', () => {
      const singleRange = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024' }
      ];
      expect(validateDates(singleRange)).toBeNull();
    });

    test('should handle unsorted data correctly', () => {
      const unsortedData = [
        { 'data inizio': '11/01/2024', 'data fine': '15/01/2024' },
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024' },
        { 'data inizio': '06/01/2024', 'data fine': '10/01/2024' }
      ];
      expect(validateDates(unsortedData)).toBeNull();
    });
  });

  describe('formatDate', () => {
    test('should format ISO string to DD-MM-YYYY in local timezone', () => {
      expect(formatDate('2024-12-25T00:00:00.000Z')).toBe('25-12-2024');
      expect(formatDate('2024-01-01T12:30:00.000Z')).toBe('01-01-2024');
      // Note: 23:59:59.999Z potrebbe essere il giorno dopo nel fuso orario locale
      const result = formatDate('2024-06-15T23:59:59.999Z');
      expect(result).toMatch(/^1[56]-06-2024$/); // Può essere 15 o 16 a seconda del fuso orario
    });

    test('should handle different ISO string formats', () => {
      expect(formatDate('2024-12-25')).toBe('25-12-2024');
      expect(formatDate('2024-12-25T10:30:00')).toBe('25-12-2024');
    });
  });

  describe('convertDate', () => {
    test('should convert DD-MM-YYYY to YYYY-MM-DD', () => {
      expect(convertDate('25-12-2024')).toBe('2024-12-25');
      expect(convertDate('01-01-2024')).toBe('2024-01-01');
      expect(convertDate('15-06-2024')).toBe('2024-06-15');
    });

    test('should throw error for invalid format', () => {
      expect(() => convertDate('invalid-date')).toThrow('Formato data non valido');
      expect(() => convertDate('2024-12-25')).toThrow('Formato data non valido');
      expect(() => convertDate('25/12/2024')).toThrow('Formato data non valido');
      expect(() => convertDate('')).toThrow('Formato data non valido');
    });

    test('should handle edge cases', () => {
      expect(convertDate('29-02-2024')).toBe('2024-02-29'); // Leap year
      expect(convertDate('31-12-2023')).toBe('2023-12-31'); // Year end
      expect(convertDate('01-01-2024')).toBe('2024-01-01'); // Year start
    });
  });
});