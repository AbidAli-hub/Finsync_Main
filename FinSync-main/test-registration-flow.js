// Test the exact registration flow with debugging
import http from 'http';

// Test cases that might cause the "invalid email" error
const testCases = [
  {
    name: 'Normal registration',
    data: {
      email: 'test' + Date.now() + '@example.com',
      password: 'testpassword123',
      name: 'Test User',
      company: 'Test Company'
    }
  },
  {
    name: 'Email with leading space',
    data: {
      email: ' ' + 'test' + Date.now() + '@example.com',
      password: 'testpassword123',
      name: 'Test User',
      company: 'Test Company'
    }
  },
  {
    name: 'Email with trailing space',
    data: {
      email: 'test' + Date.now() + '@example.com' + ' ',
      password: 'testpassword123',
      name: 'Test User',
      company: 'Test Company'
    }
  },
  {
    name: 'Email with spaces in domain',
    data: {
      email: 'test' + Date.now() + '@ example.com',
      password: 'testpassword123',
      name: 'Test User',
      company: 'Test Company'
    }
  }
];

async function testRegistration(testCase) {
  console.log(`\n=== Testing: ${testCase.name} ===`);
  console.log('Data being sent:', testCase.data);
  
  return new Promise((resolve) => {
    const postData = JSON.stringify(testCase.data);
    
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
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        try {
          const response = JSON.parse(data);
          console.log('Response:', response);
          resolve({ success: res.statusCode === 201, response });
        } catch (e) {
          console.log('Raw response:', data);
          resolve({ success: res.statusCode === 201, response: data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('Request error:', error.message);
      resolve({ success: false, error: error.message });
    });
    
    req.write(postData);
    req.end();
  });
}

async function runAllTests() {
  console.log('Starting registration flow tests...');
  
  for (const testCase of testCases) {
    try {
      const result = await testRegistration(testCase);
      if (result.success) {
        console.log('✅ Test passed');
      } else {
        console.log('❌ Test failed');
        if (result.response && result.response.message) {
          console.log('Error message:', result.response.message);
        }
      }
    } catch (error) {
      console.log('Test error:', error.message);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=== All tests completed ===');
}

// Run tests if server is available, otherwise just show what we would test
console.log('This test requires the server to be running on port 5000');
console.log('If the server is not running, you will see connection errors');
console.log('The tests will proceed anyway to show the data flow...\n');

runAllTests();