// Create a test user
import axios from 'axios';

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Register a new user
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      email: 'test@example.com',
      name: 'Test User',
      password: 'testpassword123',
      company: 'Test Company'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User created successfully:', registerResponse.data);
    
    // Test login with the new user
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'testpassword123',
      sessionId: 'test-session-' + Date.now()
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

createTestUser();