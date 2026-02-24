// Debug UI error handling
import fetch from 'node-fetch';

async function debugUIError() {
  console.log('🧪 Debugging UI Error Handling...');
  
  // Test with invalid email to see what error message we get
  const invalidData = {
    email: 'invalid-email', // This should trigger the email validation error
    password: 'TestPass123!',
    name: 'Test User',
    company: 'Test Company'
  };
  
  console.log('📝 Testing with invalid email:', invalidData.email);
  
  try {
    console.log('\n📡 Sending registration request with invalid email...');
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: invalidData.email,
        password: invalidData.password,
        name: invalidData.name,
        company: invalidData.company,
        phone: undefined
      }),
    });
    
    console.log('📊 Response Status:', response.status);
    const responseBody = await response.text();
    console.log('📄 Response Body:', responseBody);
    
    if (response.ok) {
      console.log('✅ Registration Successful (unexpected!)');
    } else {
      console.log('❌ Registration Failed (expected)');
      try {
        const errorData = JSON.parse(responseBody);
        console.log('📋 Error Message:', errorData.message);
      } catch (parseError) {
        console.log('⚠️ Could not parse error response as JSON');
      }
    }
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
  
  // Test with empty email
  console.log('\n--- Testing with empty email ---');
  const emptyData = {
    email: '', // Empty email
    password: 'TestPass123!',
    name: 'Test User',
    company: 'Test Company'
  };
  
  console.log('📝 Testing with empty email');
  
  try {
    console.log('\n📡 Sending registration request with empty email...');
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emptyData.email,
        password: emptyData.password,
        name: emptyData.name,
        company: emptyData.company,
        phone: undefined
      }),
    });
    
    console.log('📊 Response Status:', response.status);
    const responseBody = await response.text();
    console.log('📄 Response Body:', responseBody);
    
    if (response.ok) {
      console.log('✅ Registration Successful (unexpected!)');
    } else {
      console.log('❌ Registration Failed (expected)');
      try {
        const errorData = JSON.parse(responseBody);
        console.log('📋 Error Message:', errorData.message);
      } catch (parseError) {
        console.log('⚠️ Could not parse error response as JSON');
      }
    }
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
  
  // Test with whitespace-only email
  console.log('\n--- Testing with whitespace-only email ---');
  const whitespaceData = {
    email: '   ', // Whitespace-only email
    password: 'TestPass123!',
    name: 'Test User',
    company: 'Test Company'
  };
  
  console.log('📝 Testing with whitespace-only email:', JSON.stringify(whitespaceData.email));
  
  try {
    console.log('\n📡 Sending registration request with whitespace-only email...');
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: whitespaceData.email,
        password: whitespaceData.password,
        name: whitespaceData.name,
        company: whitespaceData.company,
        phone: undefined
      }),
    });
    
    console.log('📊 Response Status:', response.status);
    const responseBody = await response.text();
    console.log('📄 Response Body:', responseBody);
    
    if (response.ok) {
      console.log('✅ Registration Successful (unexpected!)');
    } else {
      console.log('❌ Registration Failed (expected)');
      try {
        const errorData = JSON.parse(responseBody);
        console.log('📋 Error Message:', errorData.message);
      } catch (parseError) {
        console.log('⚠️ Could not parse error response as JSON');
      }
    }
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

debugUIError();