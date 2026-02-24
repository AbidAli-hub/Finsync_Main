// Comprehensive database authentication debugging script
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function debugDatabaseAuth() {
  let connection;
  
  try {
    console.log('🔧 FINSYNC DATABASE AUTHENTICATION DEBUG');
    console.log('=' .repeat(50));
    
    // Test environment variables
    console.log('\n📋 Environment Variables:');
    console.log(`DB_HOST: ${process.env.DB_HOST || 'NOT SET'}`);
    console.log(`DB_PORT: ${process.env.DB_PORT || 'NOT SET'}`);
    console.log(`DB_USER: ${process.env.DB_USER || 'NOT SET'}`);
    console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '[HIDDEN]' : 'NOT SET'}`);
    console.log(`DB_NAME: ${process.env.DB_NAME || 'NOT SET'}`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '[HIDDEN]' : 'NOT SET'}`);
    
    // Test database connection
    console.log('\n🔌 Testing Database Connection...');
    const connectionConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Vtu24497',
      database: process.env.DB_NAME || 'finsync',
    };
    
    console.log('Connection config:', {
      ...connectionConfig,
      password: '[HIDDEN]'
    });
    
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Database connection successful!');
    
    // Check if users table exists
    console.log('\n📊 Checking Users Table...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'users'"
    );
    
    if (Array.isArray(tables) && tables.length === 0) {
      console.log('❌ Users table does not exist!');
      console.log('💡 Create the table by running migrations or:');
      console.log(`
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(20),
  avatar TEXT,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`);
      return;
    }
    
    console.log('✅ Users table exists');
    
    // Get all users
    console.log('\n👥 Users in Database:');
    const [users] = await connection.execute('SELECT id, email, name, company, phone, password FROM users');
    
    if (Array.isArray(users) && users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('💡 Create a test user by registering through the application');
      return;
    }
    
    console.log(`Found ${users.length} user(s):`);
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User Details:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Company: ${user.company || 'Not set'}`);
      console.log(`   Phone: ${user.phone || 'Not set'}`);
      console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
      console.log(`   Password Length: ${user.password.length} chars`);
      
      // Check if password looks like bcrypt hash
      if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
        console.log('   ✅ Password appears to be properly hashed (bcrypt)');
      } else {
        console.log('   ⚠️  Password may not be properly hashed!');
      }
    });
    
    // Test specific user authentication
    console.log('\n🔐 Authentication Test:');
    const testEmail = 'abidalilmajestic@gmail.com';
    const testPassword = 'vtu24497';
    
    console.log(`Testing login for: ${testEmail}`);
    console.log(`With password: ${testPassword}`);
    
    const [userRows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?', 
      [testEmail]
    );
    
    if (Array.isArray(userRows) && userRows.length > 0) {
      const user = userRows[0];
      console.log('✅ User found in database');
      console.log(`User ID: ${user.id}`);
      console.log(`Stored password hash: ${user.password.substring(0, 30)}...`);
      
      try {
        const isPasswordValid = await bcrypt.compare(testPassword, user.password);
        console.log(`🔑 Password validation result: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);
        
        if (!isPasswordValid) {
          console.log('\n🔍 Password Debugging:');
          console.log(`Input password: "${testPassword}"`);
          console.log(`Password length: ${testPassword.length}`);
          console.log(`Hash type: ${user.password.substring(0, 4)}`);
          
          // Test with a few common variations
          const variations = [
            testPassword.toLowerCase(),
            testPassword.toUpperCase(),
            testPassword.trim(),
          ];
          
          for (const variation of variations) {
            if (variation !== testPassword) {
              const testResult = await bcrypt.compare(variation, user.password);
              console.log(`Testing "${variation}": ${testResult ? '✅ VALID' : '❌ INVALID'}`);
            }
          }
        }
      } catch (bcryptError) {
        console.log('❌ Bcrypt comparison failed:', bcryptError.message);
      }
    } else {
      console.log('❌ User not found with that email');
      
      // Check for similar emails
      console.log('\n🔍 Checking for similar emails...');
      const [similarRows] = await connection.execute(
        'SELECT email FROM users WHERE email LIKE ?', 
        [`%${testEmail.split('@')[0]}%`]
      );
      
      if (Array.isArray(similarRows) && similarRows.length > 0) {
        console.log('📧 Found similar emails:');
        similarRows.forEach(row => {
          console.log(`   - ${row.email}`);
        });
      } else {
        console.log('📭 No similar emails found');
      }
    }
    
    // Test creating a new user with proper password hashing
    console.log('\n🆕 Testing User Creation with Proper Hashing:');
    const testNewEmail = 'debug.test@example.com';
    const testNewPassword = 'testpassword123';
    
    // Check if test user already exists
    const [existingTest] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [testNewEmail]
    );
    
    if (Array.isArray(existingTest) && existingTest.length === 0) {
      const hashedPassword = await bcrypt.hash(testNewPassword, 10);
      const userId = `test-${Date.now()}`;
      
      await connection.execute(
        'INSERT INTO users (id, email, name, company, password) VALUES (?, ?, ?, ?, ?)',
        [userId, testNewEmail, 'Debug Test User', 'Test Company', hashedPassword]
      );
      
      console.log('✅ Test user created successfully');
      
      // Verify the test user can authenticate
      const testAuth = await bcrypt.compare(testNewPassword, hashedPassword);
      console.log(`🔑 Test user authentication: ${testAuth ? '✅ VALID' : '❌ INVALID'}`);
      
      // Clean up test user
      await connection.execute('DELETE FROM users WHERE email = ?', [testNewEmail]);
      console.log('🗑️  Test user cleaned up');
    } else {
      console.log('ℹ️  Test user already exists, skipping creation');
    }
    
  } catch (error) {
    console.error('❌ Database debug failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting steps:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check if MySQL service is started');
      console.log('3. Verify MySQL is listening on port 3306');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Troubleshooting steps:');
      console.log('1. Check MySQL username and password');
      console.log('2. Verify user has access to the database');
      console.log('3. Check if password in .env file is correct');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Troubleshooting steps:');
      console.log('1. Create the database: CREATE DATABASE finsync;');
      console.log('2. Run database migrations');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the debug script
debugDatabaseAuth().catch(console.error);