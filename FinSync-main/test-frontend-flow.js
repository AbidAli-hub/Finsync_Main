// Test registration with exact same data flow as frontend
import http from 'http';

// Simulate the exact data that the frontend sends
// This is what the auth page sends to the register function
const formData = {
  email: 'test' + Date.now() + '@example.com',
  password: 'testpassword123',
  name: 'Test User',
  company: 'Test Company'
};

console.log('Testing registration with frontend data flow...');
console.log('Form data being sent:', formData);

// Create the request exactly as the frontend would
const postData = JSON.stringify(formData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Sending request to:', options);

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`Response Status: ${res.statusCode}`);
  console.log(`Response Headers: ${JSON.stringify(res.headers)}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Raw response body:', data);
    
    try {
      const response = JSON.parse(data);
      console.log('Parsed response:', response);
      
      if (res.statusCode === 201) {
        console.log('✅ Registration successful!');
      } else if (res.statusCode === 400) {
        console.log('❌ Registration failed with validation error');
        if (response.message) {
          console.log('Error message:', response.message);
        }
      } else {
        console.log('❌ Registration failed with status:', res.statusCode);
      }
    } catch (parseError) {
      console.log('Response is not JSON:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  console.log('This might mean the server is not running on port 5000');
});

req.write(postData);
req.end();