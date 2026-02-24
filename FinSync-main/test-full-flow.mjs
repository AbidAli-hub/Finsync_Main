// Test the full frontend to backend flow
import fetch from 'node-fetch';

async function testFullFlow() {
  console.log('🧪 Testing Full Frontend to Backend Flow...');
  
  // Simulate the exact data structure from the auth page
  const formData = {
    email: 'fullflow@example.com',
    password: 'FullFlowPass123!',
    name: 'Full Flow User',
    company: 'Full Flow Company'
  };
  
  console.log('📝 Form data (as sent from auth page):', formData);
  
  try {
    console.log('\n📡 Sending registration request (simulating auth page call)...');
    // This is exactly how the auth page calls the register function
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        company: formData.company,
        phone: undefined // This is what we pass as the 5th parameter
      }),
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
  
  // Also test with the original problematic user data
  console.log('\n--- Testing with original user data ---');
  const originalData = {
    email: 'vtu24588@veltech.edu.in',
    password: 'vtu24588',
    name: 'vamsi',
    company: 'Rasa ai labs'
  };
  
  console.log('📝 Original user data:', originalData);
  
  try {
    console.log('\n📡 Sending registration request with original data...');
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: originalData.email,
        password: originalData.password,
        name: originalData.name,
        company: originalData.company,
        phone: undefined
      }),
    });
    
    console.log('📊 Response Status:', response.status);
    const responseBody = await response.text();
    console.log('📄 Response Body:', responseBody);
    
    if (response.ok) {
      console.log('✅ Original User Registration Successful!');
    } else {
      console.log('❌ Original User Registration Failed');
    }
  } catch (error) {
    console.error('💥 Original user test failed:', error.message);
  }
}

testFullFlow();