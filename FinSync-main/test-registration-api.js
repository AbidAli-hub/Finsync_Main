// Test registration API endpoint directly
import http from 'http';

// Test data
const testData = {
  email: 'test' + Date.now() + '@example.com', // Unique email each time
  password: 'testpassword123',
  name: 'Test User',
  company: 'Test Company',
  phone: '+1234567890'
};

console.log('Testing registration with data:', testData);

// Create HTTP request to the registration endpoint
const postData = JSON.stringify(testData);

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

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
    
    try {
      const response = JSON.parse(data);
      console.log('Parsed response:', response);
      
      if (res.statusCode === 201) {
        console.log('✅ Registration successful!');
      } else {
        console.log('❌ Registration failed with status:', res.statusCode);
      }
    } catch (error) {
      console.log('Response is not JSON:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
});

req.write(postData);
req.end();