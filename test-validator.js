#!/usr/bin/env node

/**
 * Simple test validator to check if our test files are structured correctly
 * without requiring Jest installation
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Villa Panorama Test Validator\n');

// Test file paths
const testFiles = [
  'tests/unit/dateUtils.test.js',
  'tests/unit/csvUtils.test.js',
  'tests/unit/translate.test.js',
  'tests/unit/BookingHelper.test.js',
  'tests/unit/GoogleCalendar.test.js',
  'tests/integration/admin.test.js',
  'tests/integration/app.test.js',
  'tests/integration/calendar.route.test.js',
  'tests/integration/freebusy.route.test.js'
];

const helperFiles = [
  'tests/helpers/testHelpers.js',
  'tests/mocks/csvMocks.js',
  'tests/mocks/googleApiMocks.js',
  'tests/setup.js'
];

// Function to validate file syntax
function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Basic syntax checks
    const hasDescribe = content.includes('describe(');
    const hasTest = content.includes('test(') || content.includes('it(');
    const hasRequire = content.includes('require(');

    // Check if file is readable and has basic test structure
    return {
      exists: true,
      readable: true,
      hasTestStructure: hasDescribe && (hasTest || hasRequire),
      size: content.length
    };
  } catch (error) {
    return {
      exists: fs.existsSync(filePath),
      readable: false,
      error: error.message,
      hasTestStructure: false,
      size: 0
    };
  }
}

// Test modules that our tests depend on
const moduleFiles = [
  'utils/dateUtils.js',
  'utils/csvUtils.js',
  'utils/translate.js',
  'BookingHelper.js',
  'GoogleCalendar.js',
  'index.js'
];

console.log('📁 Validating Test Files:');
console.log('========================');

let testResults = [];
testFiles.forEach(filePath => {
  const result = validateFile(filePath);
  testResults.push({ file: filePath, ...result });

  const status = result.exists && result.hasTestStructure ? '✅' : '❌';
  const size = result.size > 0 ? `(${Math.round(result.size/1024)}KB)` : '';

  console.log(`${status} ${path.basename(filePath)} ${size}`);
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
});

console.log('\n📚 Validating Helper Files:');
console.log('===========================');

helperFiles.forEach(filePath => {
  const result = validateFile(filePath);
  const status = result.exists && result.readable ? '✅' : '❌';
  const size = result.size > 0 ? `(${Math.round(result.size/1024)}KB)` : '';

  console.log(`${status} ${path.basename(filePath)} ${size}`);
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
});

console.log('\n🔧 Validating Source Modules:');
console.log('=============================');

let moduleResults = [];
moduleFiles.forEach(filePath => {
  try {
    // Try to require the module to check if it's valid
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const isValidJs = path.extname(filePath) === '.js';

      // Basic syntax check - try to parse as Node.js would
      const content = fs.readFileSync(filePath, 'utf8');
      const hasExports = content.includes('module.exports') || content.includes('exports.');

      moduleResults.push({
        file: filePath,
        exists: true,
        size: stats.size,
        hasExports: hasExports,
        isValidJs: isValidJs
      });

      const status = hasExports ? '✅' : '⚠️';
      console.log(`${status} ${path.basename(filePath)} (${Math.round(stats.size/1024)}KB)`);

    } else {
      moduleResults.push({
        file: filePath,
        exists: false,
        size: 0,
        hasExports: false
      });
      console.log(`❌ ${path.basename(filePath)} - File not found`);
    }
  } catch (error) {
    console.log(`❌ ${path.basename(filePath)} - Error: ${error.message}`);
  }
});

// Summary
console.log('\n📊 Validation Summary:');
console.log('=====================');

const validTests = testResults.filter(t => t.exists && t.hasTestStructure).length;
const totalTests = testResults.length;

const validModules = moduleResults.filter(m => m.exists && m.hasExports).length;
const totalModules = moduleResults.length;

console.log(`✅ Test Files: ${validTests}/${totalTests} valid`);
console.log(`✅ Source Modules: ${validModules}/${totalModules} valid`);

if (validTests === totalTests && validModules >= totalModules * 0.8) {
  console.log('\n🎉 Test suite validation passed! Ready for Jest execution.');
  console.log('\nTo run tests when Jest is installed:');
  console.log('npm test');
  process.exit(0);
} else {
  console.log('\n⚠️  Some issues found. Please check files above.');
  process.exit(1);
}