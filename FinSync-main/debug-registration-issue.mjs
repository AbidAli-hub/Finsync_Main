// Debug registration issue
import axios from 'axios';

async function debugRegistrationIssue() {
  try {
    console.log('Testing registration with user data...');
    
    // Test registration with the same data the user is trying to use
    const registrationData = {
      email: 'vtu24588@veltech.edu.in',
      password: 'vtu24588',
      name: 'vamsi',
      company: 'Rasa ai labs'
    };
    
    console.log('Sending registration data:', registrationData);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', registrationData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Registration successful:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    console.error('- Message:', error.message);
    console.error('- Code:', error.code);
    console.error('- Response data:', error.response?.data);
    console.error('- Status code:', error.response?.status);
    console.error('- Response headers:', error.response?.headers);
    
    // Log the full error object
    console.error('- Full error object:', JSON.stringify(error, null, 2));
  }
}

debugRegistrationIssue();