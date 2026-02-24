// Test MySQL connection
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  try {
    console.log('Testing MySQL connection...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'finsync',
    });

    console.log('✅ Successfully connected to MySQL database!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database query test successful:', rows);
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();