// Check users in database
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkUsers() {
  let connection;
  
  try {
    console.log('Checking users in database...');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Vtu24497',
      database: process.env.DB_NAME || 'finsync'
    });
    
    console.log('✅ Connected to database');
    
    // Check users
    const [users] = await connection.execute("SELECT id, email, name, phone, password FROM users");
    console.log('Users in database:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - Phone: ${user.phone}`);
      console.log(`     Password hash: ${user.password.substring(0, 20)}...`);
    });
    
  } catch (error) {
    console.error('❌ Failed to check users:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkUsers();