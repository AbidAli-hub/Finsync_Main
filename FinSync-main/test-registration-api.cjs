const axios = require('axios');

async function testRegistrationAPI() {
  try {
    console.log('Testing registration API endpoint...');
    
    // Test registration data
    const registrationData = {
      email: `api-test-${Date.now()}@example.com`,
      password: 'testpassword123',
      name: 'API Test User',
      company: 'API Test Company',
      phone: '+91 9876543210'
    };
    
    console.log('Sending registration data:', registrationData);
    
    // Test the registration endpoint
    const response = await axios.post('http://localhost:5000/api/auth/register', registrationData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Registration API test successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('❌ Registration API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testRegistrationAPI();