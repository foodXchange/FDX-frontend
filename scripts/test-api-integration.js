const axios = require('axios');

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Test API endpoints
async function testApiIntegration() {
  console.log('🧪 Testing API Integration...');
  console.log('API Base URL:', API_BASE_URL);
  
  const tests = [
    { name: 'Health Check', endpoint: '/health', method: 'GET' },
    { name: 'Auth Login', endpoint: '/auth/login', method: 'POST', data: { email: 'test@example.com', password: 'password' } },
    { name: 'Orders List', endpoint: '/orders', method: 'GET' },
    { name: 'RFQ List', endpoint: '/rfq', method: 'GET' },
    { name: 'Products List', endpoint: '/products', method: 'GET' },
    { name: 'Suppliers List', endpoint: '/suppliers', method: 'GET' },
    { name: 'Samples List', endpoint: '/samples', method: 'GET' },
    { name: 'Experts List', endpoint: '/experts', method: 'GET' },
    { name: 'Compliance Rules', endpoint: '/compliance/rules/food', method: 'GET' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const config = {
        method: test.method,
        url: `${API_BASE_URL}${test.endpoint}`,
        timeout: 5000,
        ...(test.data && { data: test.data })
      };
      
      const response = await axios(config);
      console.log(`✅ ${test.name}: ${response.status}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some API endpoints are not available. Using mock data fallback.');
    process.exit(1);
  } else {
    console.log('\n🎉 All API endpoints are healthy!');
    process.exit(0);
  }
}

testApiIntegration().catch(error => {
  console.error('❌ API test failed:', error.message);
  process.exit(1);
});