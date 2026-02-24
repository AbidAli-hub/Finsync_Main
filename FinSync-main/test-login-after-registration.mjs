// Test login after registration
import axios from 'axios';

async function testLoginAfterRegistration() {
  try {
    console.log('Testing login with registered user credentials...');
    
    // Test login with the same data the user is trying to use
    const loginData = {
      email: 'vtu24588@veltech.edu.in',
      password: 'vtu24588',
      sessionId: 'test-session-' + Date.now()
    };
    
    console.log('Sending login data:', loginData);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Login successful:', response.data);
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    console.error('Status code:', error.response?.status);
  }
}

testLoginAfterRegistration();