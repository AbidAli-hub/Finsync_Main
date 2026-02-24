// Test script to debug signup flow
const testSignup = async () => {
  console.log('🧪 Starting signup test...');
  
  // Test data
  const testData = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
    company: 'Test Company',
    phone: '+1234567890'
  };
  
  console.log('📝 Test data:', testData);
  
  try {
    // Test 1: Direct API call to registration endpoint
    console.log('\n📡 Test 1: Direct API call to /api/auth/register');
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response status text:', response.statusText);
    
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      try {
        const responseData = JSON.parse(responseText);
        console.log('📋 Response data:', responseData);
      } catch (e) {
        console.log('⚠️  Could not parse response as JSON');
      }
    } else {
      console.log('❌ Registration failed');
      try {
        const errorData = JSON.parse(responseText);
        console.log('📋 Error data:', errorData);
      } catch (e) {
        console.log('⚠️  Could not parse error response as JSON');
      }
    }
    
    // Test 2: Check if user exists in database
    console.log('\n🔍 Test 2: Checking if user exists in database');
    const checkResponse = await fetch(`http://localhost:5000/api/test-user?email=${testData.email}`);
    console.log('📊 Check response status:', checkResponse.status);
    
    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      console.log('📋 User check result:', checkData);
    } else {
      console.log('❌ User check failed');
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
};

// Add a test endpoint to check if user exists
const addTestEndpoint = () => {
  // This would be added to the server routes
  console.log('\n🔧 To add user check endpoint, add this to server/routes.ts:');
  console.log(`
  // Test endpoint to check if user exists
  app.get("/api/test-user", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const storage = await getStorage();
      const user = await storage.getUserByEmail(email);
      
      if (user) {
        res.json({ exists: true, user: { id: user.id, email: user.email, name: user.name } });
      } else {
        res.json({ exists: false });
      }
    } catch (error) {
      console.error('User check error:', error);
      res.status(500).json({ message: "Failed to check user" });
    }
  });
  `);
};

testSignup();
addTestEndpoint();