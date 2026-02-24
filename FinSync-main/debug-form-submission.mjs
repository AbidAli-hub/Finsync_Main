import fetch from 'node-fetch';

// Test the exact flow that happens when a user submits the signup form
async function debugFormSubmission() {
  console.log('🧪 Debugging Form Submission...');
  
  // Simulate the exact data structure that would be sent from the frontend
  const formData = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
    company: 'Test Company',
    phone: '+1234567890'
  };
  
  console.log('📝 Form data being sent:', formData);
  
  try {
    console.log('\n📡 Sending registration request (simulating frontend submission)...');
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
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
  
  // Also test with minimal data (like what might happen if some fields are empty)
  console.log('\n--- Testing with minimal data ---');
  const minimalData = {
    email: 'minimal@example.com',
    password: 'Minimal123!',
    name: 'Minimal User',
    company: 'Minimal Company'
    // Note: phone is omitted to test optional field handling
  };
  
  console.log('📝 Minimal form data:', minimalData);
  
  try {
    console.log('\n📡 Sending minimal registration request...');
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalData),
    });
    
    console.log('📊 Response Status:', response.status);
    const responseBody = await response.text();
    console.log('📄 Response Body:', responseBody);
    
    if (response.ok) {
      console.log('✅ Minimal Registration Successful!');
    } else {
      console.log('❌ Minimal Registration Failed');
    }
  } catch (error) {
    console.error('💥 Minimal test failed:', error.message);
  }
}

debugFormSubmission();