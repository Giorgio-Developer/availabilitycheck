// CSV data mocks for testing

const createMockCsvData = (roomName, dateRanges = []) => {
  if (dateRanges.length === 0) {
    // Default date ranges for a full year
    return [
      { 'data inizio': '01/01/2024', 'data fine': '31/03/2024', 'costo': '80.00' },
      { 'data inizio': '01/04/2024', 'data fine': '30/06/2024', 'costo': '100.00' },
      { 'data inizio': '01/07/2024', 'data fine': '31/08/2024', 'costo': '150.00' },
      { 'data inizio': '01/09/2024', 'data fine': '31/12/2024', 'costo': '90.00' }
    ];
  }

  return dateRanges.map(range => ({
    'data inizio': range.startDate,
    'data fine': range.endDate,
    'costo': range.cost
  }));
};

const createMockBookingData = (startDate, endDate, cost) => ({
  'data inizio': startDate,
  'data fine': endDate,
  'costo': cost
});

const mockRoomPrices = {
  'Villa Panorama': [
    { 'data inizio': '01/01/2024', 'data fine': '31/03/2024', 'costo': '120.00' },
    { 'data inizio': '01/04/2024', 'data fine': '30/06/2024', 'costo': '150.00' },
    { 'data inizio': '01/07/2024', 'data fine': '31/08/2024', 'costo': '200.00' },
    { 'data inizio': '01/09/2024', 'data fine': '31/12/2024', 'costo': '130.00' }
  ],
  'Calypso': [
    { 'data inizio': '01/01/2024', 'data fine': '31/03/2024', 'costo': '100.00' },
    { 'data inizio': '01/04/2024', 'data fine': '30/06/2024', 'costo': '120.00' },
    { 'data inizio': '01/07/2024', 'data fine': '31/08/2024', 'costo': '180.00' },
    { 'data inizio': '01/09/2024', 'data fine': '31/12/2024', 'costo': '110.00' }
  ],
  'Hermes': [
    { 'data inizio': '01/01/2024', 'data fine': '31/03/2024', 'costo': '90.00' },
    { 'data inizio': '01/04/2024', 'data fine': '30/06/2024', 'costo': '110.00' },
    { 'data inizio': '01/07/2024', 'data fine': '31/08/2024', 'costo': '160.00' },
    { 'data inizio': '01/09/2024', 'data fine': '31/12/2024', 'costo': '100.00' }
  ],
  'Elettra': [
    { 'data inizio': '01/01/2024', 'data fine': '31/03/2024', 'costo': '85.00' },
    { 'data inizio': '01/04/2024', 'data fine': '30/06/2024', 'costo': '105.00' },
    { 'data inizio': '01/07/2024', 'data fine': '31/08/2024', 'costo': '155.00' },
    { 'data inizio': '01/09/2024', 'data fine': '31/12/2024', 'costo': '95.00' }
  ],
  'Demetra': [
    { 'data inizio': '01/01/2024', 'data fine': '31/03/2024', 'costo': '95.00' },
    { 'data inizio': '01/04/2024', 'data fine': '30/06/2024', 'costo': '115.00' },
    { 'data inizio': '01/07/2024', 'data fine': '31/08/2024', 'costo': '165.00' },
    { 'data inizio': '01/09/2024', 'data fine': '31/12/2024', 'costo': '105.00' }
  ],
  'Iris Oasis': [
    { 'data inizio': '01/01/2024', 'data fine': '31/03/2024', 'costo': '110.00' },
    { 'data inizio': '01/04/2024', 'data fine': '30/06/2024', 'costo': '130.00' },
    { 'data inizio': '01/07/2024', 'data fine': '31/08/2024', 'costo': '190.00' },
    { 'data inizio': '01/09/2024', 'data fine': '31/12/2024', 'costo': '120.00' }
  ]
};

const createValidDateRange = (startDate, endDate, cost) => ({
  'data inizio': startDate,
  'data fine': endDate,
  'costo': cost.toString()
});

const createOverlappingDateRanges = () => [
  { 'data inizio': '01/01/2024', 'data fine': '10/01/2024', 'costo': '100.00' },
  { 'data inizio': '05/01/2024', 'data fine': '15/01/2024', 'costo': '120.00' } // Overlaps with first
];

const createDateRangesWithGap = () => [
  { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100.00' },
  { 'data inizio': '08/01/2024', 'data fine': '15/01/2024', 'costo': '120.00' } // Gap between 05/01 and 08/01
];

const createValidConsecutiveDateRanges = () => [
  { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', 'costo': '100.00' },
  { 'data inizio': '06/01/2024', 'data fine': '10/01/2024', 'costo': '120.00' },
  { 'data inizio': '11/01/2024', 'data fine': '15/01/2024', 'costo': '110.00' }
];

module.exports = {
  createMockCsvData,
  createMockBookingData,
  mockRoomPrices,
  createValidDateRange,
  createOverlappingDateRanges,
  createDateRangesWithGap,
  createValidConsecutiveDateRanges
};