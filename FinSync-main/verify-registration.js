// Final verification script - Test registration with unique email
import http from 'http';

console.log('=== FinSync Registration Verification ===\n');

// Generate unique test data
const timestamp = Date.now();
const testData = {
  email: `verify-${timestamp}@example.com`,
  password: 'verify123',
  name: 'Verification Test',
  company: 'Test Company'
};

console.log('Test data:', testData);

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

console.log('\nSending registration request...\n');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 201) {
        console.log('✅ REGISTRATION SUCCESSFUL!');
        console.log('User created:', response.user.email);
        console.log('\n🎉 The registration flow is working correctly!');
        console.log('🎉 No "invalid email address" errors detected.');
        
        // Clean up instructions
        console.log('\n📝 To clean up the test user:');
        console.log('   1. Check your database management tool');
        console.log(`   2. Look for user with email: ${response.user.email}`);
        console.log('   3. Delete the test user if needed');
      } else {
        console.log('❌ REGISTRATION FAILED');
        console.log('Response:', response);
        
        if (response.message) {
          console.log('Error message:', response.message);
          
          if (response.message.toLowerCase().includes('email')) {
            console.log('\n🔍 The "invalid email address" error is still occurring.');
            console.log('🔧 Recommended actions:');
            console.log('   1. Clear browser cache and try again');
            console.log('   2. Restart the development server');
            console.log('   3. Check browser Network tab for request details');
          }
        }
      }
    } catch (parseError) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ CONNECTION ERROR');
  console.log('Message:', error.message);
  console.log('\n🔧 Troubleshooting steps:');
  console.log('   1. Ensure the development server is running on port 5000');
  console.log('   2. Check if any processes are blocking port 5000');
  console.log('   3. Run "npm run dev" to start the server');
});

req.write(postData);
req.end();

console.log('\n⏳ Waiting for response...\n');