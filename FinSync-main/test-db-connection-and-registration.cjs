const mysql = require('mysql2/promise');

async function testDatabaseConnectionAndRegistration() {
  let connection;
  
  try {
    console.log('Testing database connection and registration...');
    
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
    const testEmail = `test-user-${Date.now()}@example.com`;
    const userData = {
      id: `test-id-${Date.now()}`,
      email: testEmail,
      name: 'Test User',
      company: 'Test Company',
      phone: '+91 9876543210',
      password: 'testpassword123', // In real implementation, this would be hashed
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('Creating user with data:', userData);
    
    // Insert user directly
    const [insertResult] = await connection.execute(
      'INSERT INTO users (id, email, name, company, phone, password, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userData.id,
        userData.email,
        userData.name,
        userData.company,
        userData.phone,
        userData.password,
        userData.is_active,
        userData.created_at,
        userData.updated_at
      ]
    );
    
    console.log('✅ User created successfully:', insertResult);
    
    // Retrieve the user
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [userData.email]
    );
    
    console.log('✅ User retrieved:', rows[0]);
    
    // Test duplicate email handling
    try {
      const [duplicateResult] = await connection.execute(
        'INSERT INTO users (id, email, name, company, phone, password, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          `test-id-${Date.now()}-duplicate`,
          testEmail, // Same email
          'Duplicate User',
          'Duplicate Company',
          '+91 1234567890',
          'duplicatepassword123',
          true,
          new Date(),
          new Date()
        ]
      );
      console.log('❌ Duplicate user creation should have failed but succeeded:', duplicateResult);
    } catch (error) {
      console.log('✅ Duplicate email correctly rejected:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

testDatabaseConnectionAndRegistration();