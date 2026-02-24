const mysql = require('mysql2/promise');

async function showDatabaseData() {
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

    console.log('✅ Connected to FinSync database successfully!\n');
    console.log('🗄️  FINSYNC DATABASE CONTENT OVERVIEW');
    console.log('=' .repeat(60));

    // Check each table
    const tables = ['users', 'gst_returns', 'invoices', 'uploaded_files', 'download_history'];
    
    for (const table of tables) {
      console.log(`\n📊 TABLE: ${table.toUpperCase()}`);
      console.log('-'.repeat(40));
      
      try {
        // Get row count
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const rowCount = countResult[0].count;
        
        console.log(`📈 Total Rows: ${rowCount}`);
        
        if (rowCount > 0) {
          // Get sample data (first 5 rows)
          const [rows] = await connection.execute(`SELECT * FROM ${table} LIMIT 5`);
          
          if (rows.length > 0) {
            console.log('📝 Sample Data:');
            
            // Show column headers
            const columns = Object.keys(rows[0]);
            console.log('   Columns:', columns.join(', '));
            
            // Show first few rows
            rows.forEach((row, index) => {
              console.log(`   Row ${index + 1}:`);
              columns.forEach(col => {
                let value = row[col];
                if (col === 'password') {
                  value = '***ENCRYPTED***';
                } else if (typeof value === 'string' && value.length > 50) {
                  value = value.substring(0, 50) + '...';
                }
                console.log(`     ${col}: ${value}`);
              });
              console.log('');
            });
          }
        } else {
          console.log('📭 No data found in this table');
        }
        
      } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.log('❌ Table does not exist');
        } else {
          console.log(`❌ Error querying table: ${error.message}`);
        }
      }
    }

    // Show table relationships
    console.log('\n🔗 TABLE RELATIONSHIPS');
    console.log('-'.repeat(40));
    console.log('users (1) ──┬── gst_returns (N)');
    console.log('            ├── invoices (N)');
    console.log('            ├── uploaded_files (N)');
    console.log('            └── download_history (N)');
    
    // Show database summary
    console.log('\n📋 DATABASE SUMMARY');
    console.log('-'.repeat(40));
    
    for (const table of tables) {
      try {
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const rowCount = countResult[0].count;
        console.log(`${table.padEnd(20)} : ${rowCount} records`);
      } catch (error) {
        console.log(`${table.padEnd(20)} : Error or missing`);
      }
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure MySQL server is running');
    console.log('2. Verify database credentials');
    console.log('3. Check if "finsync" database exists');
    console.log('4. Run: CREATE DATABASE IF NOT EXISTS finsync;');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the function
showDatabaseData();