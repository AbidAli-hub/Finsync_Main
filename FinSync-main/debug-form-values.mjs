// Debug form values being sent to the backend
import axios from 'axios';

async function debugFormValues() {
  try {
    console.log('=== Debugging Form Values ===');
    
    // Test with the exact data the user is trying to use
    const formData = {
      email: 'vtu24588@veltech.edu.in',
      password: 'vtu24588',
      name: 'vamsi', // This should be the full name
      company: 'Rasa ai labs',
      phone: '' // Optional
    };
    
    console.log('Form data being sent:', formData);
    console.log('Email type:', typeof formData.email);
    console.log('Email value:', formData.email);
    console.log('Is email a string?', typeof formData.email === 'string');
    console.log('Is email truthy?', !!formData.email);
    
    // Check if email is a valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log('Is email valid format?', emailRegex.test(formData.email));
    
    // Try to send to the server
    console.log('\n--- Sending to server ---');
    const response = await axios.post('http://localhost:3000/api/auth/register', formData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Server response:', response.data);
    
  } catch (error) {
    console.error('❌ Error occurred:');
    console.error('- Message:', error.message);
    console.error('- Code:', error.code);
    if (error.response) {
      console.error('- Response status:', error.response.status);
      console.error('- Response data:', error.response.data);
    }
    
    // Check if it's a network error
    if (error.code === 'ECONNREFUSED') {
      console.error('🔧 This indicates the server is not running!');
    }
  }
}

debugFormValues();