// Test creating a user without phone number
import axios from 'axios';

async function testNoPhoneUser() {
  try {
    console.log('Creating user without phone number...');
    
    // Register a new user without phone number
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      email: 'nophone@example.com',
      name: 'No Phone User',
      password: 'testpassword123',
      company: 'Test Company'
      // Note: No phone number provided
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User created successfully:', registerResponse.data);
    
    // Test login with the new user
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'nophone@example.com',
      password: 'testpassword123',
      sessionId: 'test-session-' + Date.now()
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful:', loginResponse.data);
    
    // Check if phone is null/undefined
    if (!loginResponse.data.user.phone) {
      console.log('✅ Phone number is correctly null/undefined for user without phone');
    } else {
      console.log('⚠️  Phone number is set:', loginResponse.data.user.phone);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testNoPhoneUser();