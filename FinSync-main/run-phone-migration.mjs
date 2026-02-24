// Script to add phone column to users table
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

async function runMigration() {
  let connection;
  
  try {
    console.log('🔧 Running Phone Column Migration');
    console.log('================================');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Vtu24497',
      database: process.env.DB_NAME || 'finsync'
    });
    
    console.log('✅ Connected to database');
    
    // Check if phone column exists
    console.log('\n🔍 Checking if phone column exists...');
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'",
      [process.env.DB_NAME || 'finsync']
    );
    
    if (Array.isArray(columns) && columns.length > 0) {
      console.log('✅ Phone column already exists');
    } else {
      console.log('❌ Phone column does not exist, adding it...');
      
      // Add phone column
      await connection.execute(
        "ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER company"
      );
      
      console.log('✅ Phone column added successfully');
      
      // Update existing users with default phone numbers
      console.log('\n📱 Updating existing users with default phone numbers...');
      const [result] = await connection.execute(
        "UPDATE users SET phone = CONCAT('+91 ', LPAD(FLOOR(RAND() * 9000000000 + 1000000000), 10, '0')) WHERE phone IS NULL"
      );
      
      console.log(`✅ Updated ${result.affectedRows} users with phone numbers`);
    }
    
    // Verify the structure
    console.log('\n📋 Verifying table structure...');
    const [structure] = await connection.execute("DESCRIBE users");
    console.log('Users table structure:');
    structure.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Key} ${row.Default || ''}`);
    });
    
    // Show sample data
    console.log('\n👥 Sample user data:');
    const [users] = await connection.execute("SELECT id, email, name, company, phone FROM users LIMIT 3");
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.phone || 'No phone'}`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  Phone column already exists (duplicate field error)');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('❌ Users table does not exist');
    } else {
      console.log('Error details:', error);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the migration
runMigration();