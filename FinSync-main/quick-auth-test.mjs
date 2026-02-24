import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function quickTest() {
  try {
    console.log('🔍 Quick Database Authentication Test');
    console.log('=====================================');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Vtu24497',
      database: 'finsync'
    });
    
    console.log('✅ Connected to database');
    
    // Check for users
    const [users] = await connection.execute('SELECT email, password FROM users LIMIT 5');
    console.log(`Found ${users.length} users`);
    
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`Testing user: ${testUser.email}`);
      console.log(`Password hash: ${testUser.password.substring(0, 20)}...`);
      
      // Test with common passwords
      const testPasswords = ['vtu24497', 'Vtu24497', 'VTU24497'];
      
      for (const pwd of testPasswords) {
        try {
          const result = await bcrypt.compare(pwd, testUser.password);
          console.log(`Password "${pwd}": ${result ? '✅ MATCH' : '❌ NO MATCH'}`);
        } catch (e) {
          console.log(`Password "${pwd}": ❌ ERROR - ${e.message}`);
        }
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickTest();