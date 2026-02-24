// Test registration flow with detailed debugging
import mysql from 'mysql2/promise';

async function testRegistration() {
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
    
    // Test inserting a user with phone number
    const testUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      company: 'Test Company',
      phone: '+1234567890',
      password: 'hashed_password_here',
      is_active: true
    };
    
    console.log('Attempting to insert test user:', testUser);
    
    try {
      const result = await connection.execute(
        'INSERT INTO users (id, email, name, company, phone, password, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [testUser.id, testUser.email, testUser.name, testUser.company, testUser.phone, testUser.password, testUser.is_active]
      );
      
      console.log('✅ User inserted successfully:', result);
      
      // Retrieve the user to verify
      const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [testUser.id]);
      console.log('Retrieved user:', rows[0]);
      
      // Clean up - delete the test user
      await connection.execute('DELETE FROM users WHERE id = ?', [testUser.id]);
      console.log('✅ Test user cleaned up');
      
    } catch (insertError) {
      console.error('❌ Error inserting user:', insertError);
      
      // Try inserting without phone column to see if that works
      console.log('Trying insert without phone column...');
      try {
        const result = await connection.execute(
          'INSERT INTO users (id, email, name, company, password, is_active) VALUES (?, ?, ?, ?, ?, ?)',
          [testUser.id, testUser.email, testUser.name, testUser.company, testUser.password, testUser.is_active]
        );
        
        console.log('✅ User inserted without phone successfully:', result);
        
        // Clean up
        await connection.execute('DELETE FROM users WHERE id = ?', [testUser.id]);
        console.log('✅ Test user cleaned up');
        
      } catch (fallbackError) {
        console.error('❌ Error inserting user without phone:', fallbackError);
      }
    }
    
    // Close connection
    await connection.end();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error in test registration:', error);
  }
}

testRegistration();