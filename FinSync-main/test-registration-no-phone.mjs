// Test registration without phone number
import axios from 'axios';

async function testRegistrationNoPhone() {
  try {
    console.log('Testing registration without phone number...');
    
    // Test registration without phone number
    const registrationData = {
      email: `no-phone-${Date.now()}@example.com`, // Use unique email
      password: 'testpassword123',
      name: 'No Phone User',
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

testRegistrationNoPhone();