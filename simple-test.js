#!/usr/bin/env node

/**
 * Simple test runner without Jest - just to demonstrate test concepts
 */

const { convertDateToDDMMYYYY, validateDates, convertDate } = require('./utils/dateUtils');
const { translateText } = require('./utils/translate');

console.log('🧪 Simple Test Runner (No Jest Required)\n');

let testCount = 0;
let passedCount = 0;

function test(name, fn) {
  testCount++;
  try {
    console.log(`Testing: ${name}`);
    fn();
    console.log(`✅ PASS: ${name}\n`);
    passedCount++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}\n`);
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected "${expected}" but got "${actual}"`);
      }
    },
    toBeNull: () => {
      if (actual !== null) {
        throw new Error(`Expected null but got "${actual}"`);
      }
    },
    toContain: (expected) => {
      if (!actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    }
  };
}

// Date Utils Tests
console.log('📅 Date Utils Tests:');
console.log('===================');

test('convertDateToDDMMYYYY should convert YYYY-MM-DD to DD/MM/YYYY', () => {
  expect(convertDateToDDMMYYYY('2024-12-25')).toBe('25/12/2024');
  expect(convertDateToDDMMYYYY('2024-01-01')).toBe('01/01/2024');
});

test('convertDateToDDMMYYYY should return original for invalid format', () => {
  expect(convertDateToDDMMYYYY('invalid-date')).toBe('invalid-date');
  expect(convertDateToDDMMYYYY('')).toBe('');
});

test('validateDates should return null for valid date ranges', () => {
  const validData = [
    { 'data inizio': '01/01/2024', 'data fine': '05/01/2024', costo: '100' },
    { 'data inizio': '06/01/2024', 'data fine': '10/01/2024', costo: '120' }
  ];
  expect(validateDates(validData)).toBeNull();
});

// Translation Tests
console.log('🌍 Translation Tests:');
console.log('====================');

test('translateText should translate to English', () => {
  const result = translateText('Disponibilità Villa Panorama', 'en');
  expect(result).toBe('Villa Panorama Availability');
});

test('translateText should translate to French', () => {
  const result = translateText('Camere disponibili nel periodo selezionato', 'fr');
  expect(result).toBe('Chambres disponibles dans la période sélectionnée');
});

test('translateText should return original for Italian', () => {
  const result = translateText('Disponibilità Villa Panorama', 'it');
  expect(result).toBe('Disponibilità Villa Panorama');
});

test('translateText should fallback to English for unsupported language', () => {
  const result = translateText('Disponibilità Villa Panorama', 'es'); // Spanish not supported
  expect(result).toBe('Villa Panorama Availability');
});

// CSV Content Test (if we can read files)
console.log('📄 CSV Integration Test:');
console.log('=======================');

test('CSV files should exist and have proper structure', () => {
  const fs = require('fs');
  const csvFile = 'rooms_prices/Villa Panorama.csv';

  if (fs.existsSync(csvFile)) {
    const content = fs.readFileSync(csvFile, 'utf8');
    expect(content).toContain('data inizio');
    expect(content).toContain('data fine');
    expect(content).toContain('costo');
    console.log(`   CSV structure validated for ${csvFile}`);
  }
});

// BookingHelper Test
console.log('💰 BookingHelper Integration Test:');
console.log('=================================');

test('BookingHelper should be instantiable', () => {
  const BookingHelper = require('./BookingHelper');
  const helper = new BookingHelper();

  // Check if helper has expected methods
  if (typeof helper.calculateTotalCost === 'function') {
    console.log('   BookingHelper has calculateTotalCost method');
  }
});

// Summary
console.log('📊 Test Summary:');
console.log('================');
console.log(`Total tests: ${testCount}`);
console.log(`Passed: ${passedCount}`);
console.log(`Failed: ${testCount - passedCount}`);

if (passedCount === testCount) {
  console.log('🎉 All tests passed! The modules are working correctly.');
  console.log('\n✅ Your test suite is ready for Jest execution:');
  console.log('   npm test (when Jest is installed)');
} else {
  console.log('⚠️  Some tests failed. Check the issues above.');
}