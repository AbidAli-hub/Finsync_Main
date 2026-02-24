import fetch from 'node-fetch';

// Test registration directly with the API
const testRegistration = async () => {
  console.log('Testing registration API...');
  
  const userData = {
    email: 'debugtest@example.com',
    password: 'TestPass123!',
    name: 'Debug Test User',
    company: 'Debug Company'
  };
  
  try {
    console.log('Sending registration request...');
    console.log('User data:', userData);
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    const text = await response.text();
    console.log('Response body:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('Parsed response:', data);
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
    
    if (response.ok) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed');
    }
  } catch (error) {
    console.error('Error during registration test:', error);
  }
};

testRegistration();