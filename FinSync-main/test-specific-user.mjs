import fetch from 'node-fetch';

// Test with the specific user data that might be causing issues
async function testSpecificUser() {
  console.log('🧪 Testing Specific User Data...');
  
  // Test with a completely new email to avoid "user already exists" errors
  const timestamp = Date.now();
  const specificUsers = [
    {
      email: `vtu24588_${timestamp}@veltech.edu.in`,
      password: 'vtu24588',
      name: 'vamsi',
      company: 'Rasa ai labs'
    },
    {
      email: `test_${timestamp}@example.com`,
      password: 'TestPass123!',
      name: 'Test User',
      company: 'Test Company'
    },
    {
      email: `user_${timestamp}@domain.co.in`,
      password: 'UserPass456@',
      name: 'User Name',
      company: 'User Company'
    }
  ];
  
  for (const userData of specificUsers) {
    console.log(`\n--- Testing user: ${userData.email} ---`);
    console.log('📝 User data:', userData);
    
    try {
      console.log('📡 Sending registration request...');
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      console.log('📊 Response Status:', response.status);
      console.log('📊 Response Status Text:', response.statusText);
      
      const responseBody = await response.text();
      console.log('📄 Response Body:', responseBody);
      
      if (response.ok) {
        console.log('✅ Registration Successful!');
        try {
          const data = JSON.parse(responseBody);
          console.log('📋 User Data:', data);
        } catch (parseError) {
          console.log('⚠️ Could not parse response as JSON');
        }
      } else {
        console.log('❌ Registration Failed');
        try {
          const errorData = JSON.parse(responseBody);
          console.log('📋 Error Details:', errorData);
        } catch (parseError) {
          console.log('⚠️ Could not parse error response as JSON');
        }
      }
    } catch (error) {
      console.error('💥 Test Failed with Error:', error.message);
    }
  }
}

testSpecificUser();