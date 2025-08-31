/**
 * Test script for API endpoints
 * Run with: node test-api.js
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://192.168.1.100:3000';

async function testEndpoint(method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`Testing ${method} ${endpoint}...`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ ${method} ${endpoint} - Status: ${response.status}`);
      return data;
    } else {
      console.log(`✗ ${method} ${endpoint} - Status: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.log(`✗ ${method} ${endpoint} - Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log(`Testing API endpoints at ${API_BASE_URL}\n`);

  // Health check
  await testEndpoint('GET', '/health');

  // Solis endpoints
  console.log('\n--- SOLIS ENDPOINTS ---');
  await testEndpoint('GET', '/solis/status');
  await testEndpoint('GET', '/solis/all');

  // Zaptec endpoints
  console.log('\n--- ZAPTEC ENDPOINTS ---');
  await testEndpoint('GET', '/zaptec/status');
  await testEndpoint('POST', '/zaptec/current', { maxCurrent: 16 });
  await testEndpoint('POST', '/zaptec/charging', { enabled: true });
  await testEndpoint('POST', '/zaptec/charging', { enabled: false });

  // Automation endpoints
  console.log('\n--- AUTOMATION ENDPOINTS ---');
  await testEndpoint('GET', '/automation/status');
  await testEndpoint('GET', '/automation/config');
  await testEndpoint('PUT', '/automation/config', { mode: 'manual' });
  await testEndpoint('POST', '/automation/enable');
  await testEndpoint('POST', '/automation/disable');

  console.log('\nAPI endpoint testing completed!');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('This script requires Node.js 18+ with fetch support');
  process.exit(1);
}

runTests().catch(console.error);