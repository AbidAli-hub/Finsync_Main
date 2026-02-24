const axios = require('axios');

async function testRegistrationEndpoint() {
  try {
    console.log('Testing registration endpoint directly...');
    
    // Test registration with proper data format
    const registrationData = {
      email: `direct-test-${Date.now()}@example.com`,
      password: 'testpassword123',
      name: 'Direct Test User',
      company: 'Test Company',
      phone: '+91 9876543210'
    };
    
    console.log('Sending registration data:', registrationData);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', registrationData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Registration successful:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
  }
}

testRegistrationEndpoint();