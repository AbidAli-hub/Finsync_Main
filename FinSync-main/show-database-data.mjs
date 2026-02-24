import mysql from 'mysql2/promise';

async function showDatabaseData() {
  let connection;
  
  try {
    // Create connection to MySQL database using existing credentials
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Vtu24497',
      database: 'finsync'
    });

    console.log('✅ Connected to FinSync database successfully!\n');
    console.log('🗄️  FINSYNC DATABASE CONTENT OVERVIEW');
    console.log('='.repeat(60));

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
          // Get sample data (first 3 rows to avoid clutter)
          const [rows] = await connection.execute(`SELECT * FROM ${table} LIMIT 3`);
          
          if (rows.length > 0) {
            console.log('📝 Sample Data:');
            
            // Show first row with all fields
            const row = rows[0];
            const columns = Object.keys(row);
            
            columns.forEach(col => {
              let value = row[col];
              if (col === 'password') {
                value = '[ENCRYPTED]';
              } else if (col === 'extracted_data' && value) {
                try {
                  const parsed = JSON.parse(value);
                  value = `JSON: ${Object.keys(parsed).join(', ')}`;
                } catch {
                  value = '[JSON Data]';
                }
              } else if (value instanceof Date) {
                value = value.toISOString().split('T')[0];
              } else if (typeof value === 'string' && value.length > 50) {
                value = value.substring(0, 50) + '...';
              }
              console.log(`   ${col}: ${value}`);
            });
            
            if (rows.length > 1) {
              console.log(`   ... and ${rows.length - 1} more rows`);
            }
          }
        } else {
          console.log('📭 Empty table');
        }
        
      } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.log('❌ Table does not exist');
        } else {
          console.log(`❌ Error querying table: ${error.message}`);
        }
      }
    }

    // Show database summary
    console.log('\n📋 DATABASE SUMMARY');
    console.log('-'.repeat(40));
    
    let totalRecords = 0;
    for (const table of tables) {
      try {
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const rowCount = countResult[0].count;
        console.log(`${table.padEnd(20)} : ${rowCount} records`);
        totalRecords += parseInt(rowCount);
      } catch (error) {
        console.log(`${table.padEnd(20)} : Error or missing`);
      }
    }
    
    console.log('-'.repeat(40));
    console.log(`Total Records        : ${totalRecords}`);
    console.log('\n🔗 Database Structure:');
    console.log('users (1) ──┬── gst_returns (N)');
    console.log('            ├── invoices (N)');
    console.log('            ├── uploaded_files (N)');
    console.log('            └── download_history (N)');

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 MySQL server is not running. Please start MySQL service.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Invalid database credentials.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Database "finsync" does not exist. Run: CREATE DATABASE finsync;');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the function
showDatabaseData();