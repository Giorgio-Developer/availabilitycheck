#!/usr/bin/env node
/**
 * Test runner script for Villa Panorama B&B booking system
 *
 * This script provides various testing options including:
 * - Running all tests
 * - Running specific test suites
 * - Generating coverage reports
 * - Running tests in watch mode
 */

const { spawn } = require('child_process');
const path = require('path');

const testSuites = {
  unit: 'tests/unit',
  integration: 'tests/integration',
  utils: 'tests/unit/dateUtils.test.js tests/unit/csvUtils.test.js tests/unit/translate.test.js',
  booking: 'tests/unit/BookingHelper.test.js',
  routes: 'tests/integration/calendar.route.test.js tests/integration/freebusy.route.test.js',
  admin: 'tests/integration/admin.test.js',
  google: 'tests/unit/GoogleCalendar.test.js',
  app: 'tests/integration/app.test.js'
};

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function installDependencies() {
  console.log('📦 Installing test dependencies...');
  try {
    await runCommand('npm', ['install', '--save-dev',
      'jest@^29.7.0',
      'supertest@^6.3.3',
      '@types/jest@^29.5.8',
      'jest-environment-node@^29.7.0'
    ]);
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

async function runTests(suite = 'all', options = {}) {
  let testPath = '';

  if (suite === 'all') {
    testPath = 'tests/';
  } else if (testSuites[suite]) {
    testPath = testSuites[suite];
  } else {
    console.error(`❌ Unknown test suite: ${suite}`);
    console.log('Available suites:', Object.keys(testSuites).join(', '));
    process.exit(1);
  }

  const jestArgs = [testPath];

  if (options.coverage) {
    jestArgs.push('--coverage');
  }

  if (options.watch) {
    jestArgs.push('--watch');
  }

  if (options.verbose) {
    jestArgs.push('--verbose');
  }

  if (options.detectOpenHandles) {
    jestArgs.push('--detectOpenHandles');
  }

  try {
    await runCommand('npx', ['jest', ...jestArgs]);
    console.log('✅ Tests completed successfully');
  } catch (error) {
    console.error('❌ Tests failed:', error.message);
    process.exit(1);
  }
}

async function checkCoverage() {
  console.log('📊 Generating coverage report...');
  try {
    await runCommand('npx', ['jest', '--coverage', '--coverageReporters=text', '--coverageReporters=html']);
    console.log('✅ Coverage report generated');
    console.log('📁 HTML report available in: coverage/lcov-report/index.html');
  } catch (error) {
    console.error('❌ Coverage generation failed:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🏨 Villa Panorama B&B Test Runner

Usage: node test-runner.js [command] [options]

Commands:
  install          Install test dependencies
  test [suite]     Run tests (default: all)
  coverage         Generate coverage report
  watch [suite]    Run tests in watch mode
  help             Show this help

Test Suites:
  all              Run all tests
  unit             Run unit tests only
  integration      Run integration tests only
  utils            Run utility function tests
  booking          Run BookingHelper tests
  routes           Run route tests
  admin            Run admin authentication tests
  google           Run Google Calendar API tests
  app              Run main app integration tests

Options:
  --verbose        Verbose output
  --detect-handles Detect open handles

Examples:
  node test-runner.js install
  node test-runner.js test
  node test-runner.js test unit
  node test-runner.js coverage
  node test-runner.js watch routes
  node test-runner.js test utils --verbose
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const suite = args[1] || 'all';

  const options = {
    coverage: args.includes('--coverage'),
    watch: command === 'watch',
    verbose: args.includes('--verbose'),
    detectOpenHandles: args.includes('--detect-handles')
  };

  console.log('🏨 Villa Panorama B&B Test Suite');
  console.log('================================');

  switch (command) {
    case 'install':
      await installDependencies();
      break;

    case 'test':
      await runTests(suite, options);
      break;

    case 'coverage':
      await checkCoverage();
      break;

    case 'watch':
      await runTests(suite, { ...options, watch: true });
      break;

    case 'help':
      showHelp();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Test runner interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Test runner terminated');
  process.exit(0);
});

// Run the main function
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

module.exports = { runTests, installDependencies, checkCoverage };