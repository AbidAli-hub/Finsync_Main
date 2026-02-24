// Test login functionality
import axios from 'axios';

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    // Test login with existing user
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'abidalilmajestic@gmail.com',
      password: 'password123',
      sessionId: 'test-session-' + Date.now()
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ Login test failed:', error.response?.data || error.message);
  }
}

testLogin();