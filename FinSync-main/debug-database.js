// Debug script to check database users
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

async function checkDatabase() {
  try {
    console.log('Connecting to MySQL database...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Vtu24497',
      database: process.env.DB_NAME || 'finsync',
    });

    console.log('✅ Connected to MySQL database');
    
    // Check if users table exists and get all users
    const [rows] = await connection.execute('SELECT id, email, name, company, password FROM users');
    
    console.log('\n📋 Users in database:');
    console.log('=====================');
    
    if (Array.isArray(rows) && rows.length === 0) {
      console.log('❌ No users found in database');
    } else {
      rows.forEach((user, index) => {
        console.log(`\n${index + 1}. User:`)
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Company: ${user.company}`);
        console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
      });
    }
    
    // Test login with the specific credentials
    const testEmail = 'abidalilmajestic@gmail.com';
    const testPassword = 'vtu24497';
    
    console.log(`\n🔐 Testing login for: ${testEmail}`);
    
    const [userRows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?', 
      [testEmail]
    );
    
    if (Array.isArray(userRows) && userRows.length > 0) {
      const user = userRows[0];
      console.log('✅ User found in database');
      
      const isPasswordValid = await bcrypt.compare(testPassword, user.password);
      console.log(`🔑 Password validation result: ${isPasswordValid}`);
    } else {
      console.log('❌ User not found with that email');
      
      // Check if there's a similar email
      console.log('\n🔍 Checking for similar emails...');
      const [similarRows] = await connection.execute(
        'SELECT email FROM users WHERE email LIKE ?', 
        [`%abidalilmajestic%`]
      );
      
      if (Array.isArray(similarRows) && similarRows.length > 0) {
        console.log('📧 Found similar emails:');
        similarRows.forEach(row => {
          console.log(`   - ${row.email}`);
        });
      }
    }
    
    await connection.end();
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase();