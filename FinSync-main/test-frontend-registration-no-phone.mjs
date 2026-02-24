// Test frontend registration flow without phone number
import axios from 'axios';

async function testFrontendRegistrationNoPhone() {
  try {
    console.log('Testing frontend registration flow without phone number...');
    
    // Test registration without phone number
    const registrationData = {
      email: `no-phone-test-${Date.now()}@example.com`,
      password: 'testpassword123',
      name: 'No Phone Test User',
      company: 'Test Company'
      // Note: No phone number provided
    };
    
    console.log('Sending registration data:', registrationData);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', registrationData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Registration successful:', response.data);
    
    // Check if phone is null/undefined
    if (!response.data.user.phone) {
      console.log('✅ Phone number is correctly null/undefined for user without phone');
    } else {
      console.log('⚠️  Phone number is set:', response.data.user.phone);
    }
    
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
  }
}

testFrontendRegistrationNoPhone();