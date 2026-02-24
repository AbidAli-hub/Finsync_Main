// Direct test of registration function with detailed debugging
import { DatabaseStorage } from './server/db-storage.ts';
import { insertUserSchema } from '@shared/schema';

async function testRegistrationFunction() {
  try {
    console.log('Testing registration function directly...');
    
    // Create test user data
    const testUserData = {
      email: 'test' + Date.now() + '@example.com',
      password: 'testpassword123',
      name: 'Test User',
      company: 'Test Company',
      phone: '+1234567890'
    };
    
    console.log('Test user data:', testUserData);
    
    // Validate with Zod schema
    try {
      const validatedData = insertUserSchema.parse(testUserData);
      console.log('✅ Zod validation passed:', validatedData);
    } catch (zodError) {
      console.log('❌ Zod validation failed:', zodError);
      return;
    }
    
    // Create database storage instance
    const storage = new DatabaseStorage();
    
    // Try to create user
    console.log('Attempting to create user...');
    const user = await storage.createUser(testUserData);
    console.log('✅ User created successfully:', user);
    
    // Clean up - delete the test user
    if (user && user.id) {
      // We can't directly delete from this test script without more setup
      console.log('User created with ID:', user.id);
    }
    
  } catch (error) {
    console.error('❌ Error in registration function test:', error);
    
    // Check if it's a specific error we can handle
    if (error.message && error.message.includes('phone')) {
      console.log('Phone column error detected');
    }
  }
}

testRegistrationFunction();