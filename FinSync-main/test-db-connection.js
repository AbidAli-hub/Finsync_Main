// Test database connection with the server environment
import { getDatabase } from './server/db.js';
import { users } from './shared/schema.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const database = await getDatabase();
    console.log('✅ Database connection established');
    
    // Test query to get all users
    const result = await database.db.select().from(users);
    console.log('📋 Users in database:');
    
    if (result.length === 0) {
      console.log('❌ No users found in database');
    } else {
      result.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Name: ${user.name}, Company: ${user.company}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testConnection();