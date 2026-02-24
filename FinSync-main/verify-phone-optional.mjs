// Verify that phone number is optional for new users
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config();

async function verifyPhoneOptional() {
  let connection;
  
  try {
    console.log('Testing phone number optional functionality...');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Vtu24497',
      database: process.env.DB_NAME || 'finsync'
    });
    
    console.log('✅ Connected to database');
    
    // Create a test user without phone number
    const userId = randomUUID();
    const email = `test-no-phone-${Date.now()}@example.com`;
    const name = 'Test No Phone User';
    const company = 'Test Company';
    const password = await bcrypt.hash('testpassword123', 10);
    
    console.log('Creating user without phone number...');
    
    // Insert user without phone number
    const [result] = await connection.execute(
      "INSERT INTO users (id, email, name, company, password, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [userId, email, name, company, password, true]
    );
    
    console.log('✅ User created successfully without phone number');
    
    // Retrieve the user to verify
    const [users] = await connection.execute(
      "SELECT id, email, name, company, phone FROM users WHERE id = ?",
      [userId]
    );
    
    const user = users[0];
    console.log('Retrieved user:', user);
    
    if (user.phone === null) {
      console.log('✅ Phone number is correctly NULL for user without phone');
    } else {
      console.log('⚠️  Phone number is:', user.phone);
    }
    
    // Clean up - delete test user
    await connection.execute("DELETE FROM users WHERE id = ?", [userId]);
    console.log('✅ Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

verifyPhoneOptional();