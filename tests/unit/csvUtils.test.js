const fs = require('fs');
const path = require('path');
const { readCSV, writeCSV } = require('../../utils/csvUtils');

// Mock fs module
jest.mock('fs');

describe('csvUtils', () => {
  const mockCsvData = [
    { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100.00' },
    { 'data inizio': '06/01/2024', 'data fine': '10/01/2024', 'costo': '120.00' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readCSV', () => {
    test('should read CSV file successfully', async () => {
      const mockCsvContent = 'data inizio,data fine,costo\n01/01/2024,05/01/2024,100.00\n06/01/2024,10/01/2024,120.00';

      // Mock createReadStream
      const mockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            // Simulate data events
            setTimeout(() => {
              callback(mockCsvData[0]);
              callback(mockCsvData[1]);
            }, 0);
          } else if (event === 'end') {
            setTimeout(callback, 0);
          }
          return mockStream;
        })
      };

      fs.createReadStream.mockReturnValue(mockStream);

      const result = await readCSV('testRoom');

      expect(fs.createReadStream).toHaveBeenCalledWith(
        path.join(__dirname, '../../rooms_prices/testRoom.csv')
      );
      expect(result).toEqual(mockCsvData);
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

      await expect(readCSV('nonExistentRoom')).rejects.toThrow('File not found');
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

      const result = await readCSV('emptyRoom');
      expect(result).toEqual([]);
    });
  });

  describe('writeCSV', () => {
    test('should write CSV file successfully', async () => {
      fs.writeFile.mockImplementation((filePath, content, callback) => {
        callback(null);
      });

      await writeCSV('testRoom', mockCsvData);

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(__dirname, '../../rooms_prices/testRoom.csv'),
        expect.stringContaining('"data inizio","data fine","costo"'),
        expect.any(Function)
      );
    });

    test('should handle write errors', async () => {
      const mockError = new Error('Write permission denied');
      fs.writeFile.mockImplementation((filePath, content, callback) => {
        callback(mockError);
      });

      await expect(writeCSV('testRoom', mockCsvData)).rejects.toThrow('Write permission denied');
    });

    test('should format CSV correctly', async () => {
      let writtenContent = '';
      fs.writeFile.mockImplementation((filePath, content, callback) => {
        writtenContent = content;
        callback(null);
      });

      await writeCSV('testRoom', mockCsvData);

      expect(writtenContent).toContain('"data inizio","data fine","costo"');
      expect(writtenContent).toContain('"01/01/2024","05/01/2024","100.00"');
      expect(writtenContent).toContain('"06/01/2024","10/01/2024","120.00"');
    });

    test('should handle empty data array', async () => {
      fs.writeFile.mockImplementation((filePath, content, callback) => {
        callback(null);
      });

      await writeCSV('testRoom', []);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        '"data inizio","data fine","costo"',
        expect.any(Function)
      );
    });

    test('should handle data with special characters', async () => {
      const specialData = [
        { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100,50' }
      ];

      fs.writeFile.mockImplementation((filePath, content, callback) => {
        callback(null);
      });

      await writeCSV('testRoom', specialData);

      expect(fs.writeFile).toHaveBeenCalled();
    });
  });
});