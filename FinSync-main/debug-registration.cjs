const { DatabaseStorage } = require('./server/db-storage.ts');
const { getDatabase } = require('./server/db.ts');

// Test registration directly
async function testRegistration() {
  try {
    console.log('Testing user registration...');
    
    const storage = new DatabaseStorage();
    
    // Test data
    const userData = {
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      name: 'Test User',
      company: 'Test Company',
      phone: '+91 9876543210'
    };
    
    console.log('Creating user with data:', userData);
    
    // Try to create user
    const user = await storage.createUser(userData);
    console.log('✅ User created successfully:', user);
    
    // Try to get user by email
    const foundUser = await storage.getUserByEmail(userData.email);
    console.log('✅ User found by email:', foundUser);
    
  } catch (error) {
    console.error('❌ Registration test failed:', error);
  }
}

testRegistration();