const mysql = require('mysql2/promise');

async function testDirectRegistration() {
  let connection;
  
  try {
    // Create connection to MySQL database
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Vtu24497',
      database: 'finsync'
    });

    console.log('✅ Connected to FinSync database successfully!');
    
    // Test data
    const userData = {
      id: 'test-user-' + Date.now(),
      email: `direct-test-${Date.now()}@example.com`,
      name: 'Direct Test User',
      company: 'Test Company',
      phone: '+91 9876543210',
      password: 'testpassword123', // In real implementation, this would be hashed
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('Creating user with data:', userData);
    
    // Insert user directly
    const [result] = await connection.execute(
      'INSERT INTO users (id, email, name, company, phone, password, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userData.id,
        userData.email,
        userData.name,
        userData.company,
        userData.phone,
        userData.password, // Note: In real implementation, this should be hashed
        userData.is_active,
        userData.created_at,
        userData.updated_at
      ]
    );
    
    console.log('✅ User created successfully:', result);
    
    // Retrieve the user
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [userData.email]
    );
    
    console.log('✅ User retrieved:', rows[0]);
    
  } catch (error) {
    console.error('❌ Registration test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDirectRegistration();