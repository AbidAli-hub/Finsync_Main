import fetch from 'node-fetch';

// Test registration with the original user data that was failing
async function testOriginalUser() {
  console.log('🧪 Testing Original User Registration...');
  
  const originalUser = {
    email: 'vtu24588@veltech.edu.in',
    password: 'vtu24588',
    name: 'vamsi',
    company: 'Rasa ai labs'
  };
  
  console.log('📝 Original user data:', originalUser);
  
  try {
    console.log('\n📡 Sending registration request...');
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(originalUser),
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

testOriginalUser();