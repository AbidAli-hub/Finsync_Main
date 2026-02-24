import mysql from 'mysql2/promise';

async function showAllTables() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Vtu24497',
      database: 'finsync'
    });

    console.log('✅ Connected to FinSync database');
    console.log('==========================================\n');
    
    const tables = ['users', 'gst_returns', 'invoices', 'uploaded_files', 'download_history'];
    
    for (const table of tables) {
      console.log(`📊 TABLE: ${table.toUpperCase()}`);
      console.log('-'.repeat(30));
      
      try {
        // Get count
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = countResult[0].count;
        console.log(`Records: ${count}`);
        
        if (count > 0) {
          // Get sample data
          const [rows] = await connection.execute(`SELECT * FROM ${table} LIMIT 2`);
          if (rows.length > 0) {
            const firstRow = rows[0];
            Object.keys(firstRow).forEach(col => {
              let value = firstRow[col];
              if (col === 'password') value = '[ENCRYPTED]';
              else if (col === 'extracted_data' && value) value = '[JSON DATA]';
              else if (typeof value === 'string' && value.length > 40) value = value.substring(0, 40) + '...';
              console.log(`  ${col}: ${value}`);
            });
          }
        }
        console.log('');
      } catch (err) {
        console.log(`❌ Error: ${err.message}\n`);
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

showAllTables();