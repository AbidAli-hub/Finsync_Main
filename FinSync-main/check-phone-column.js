// Check if phone column exists in users table
import mysql from 'mysql2/promise';

async function checkPhoneColumn() {
  try {
    // Database connection configuration
    const connectionConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Vtu24497',
      database: process.env.DB_NAME || 'finsync',
    };

    console.log('Connecting to database with config:', connectionConfig);

    // Create MySQL connection
    const connection = await mysql.createConnection(connectionConfig);
    
    console.log('✅ Database connection established');
    
    // Check if phone column exists
    const [rows] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'phone'
    `, [connectionConfig.database]);
    
    console.log('Query result:', rows);
    
    if (rows.length > 0) {
      console.log('✅ Phone column exists in users table');
    } else {
      console.log('❌ Phone column does not exist in users table');
    }
    
    // Describe the users table to see all columns
    const [describeRows] = await connection.execute('DESCRIBE users');
    console.log('Users table structure:');
    console.table(describeRows);
    
    // Close connection
    await connection.end();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error checking phone column:', error);
  }
}

checkPhoneColumn();