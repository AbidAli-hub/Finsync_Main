import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

interface DatabaseInstance {
  mysql: mysql.Connection;
  db: ReturnType<typeof drizzle>;
}

let databaseInstance: DatabaseInstance | null = null;

async function createDatabase(): Promise<DatabaseInstance> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  // Parse MySQL connection URL or use individual environment variables
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Vtu24497',
    database: process.env.DB_NAME || 'finsync',
  };

  // Create MySQL connection
  const mysqlConnection = await mysql.createConnection(connectionConfig);
  const db = drizzle(mysqlConnection, { schema, mode: 'default' });
  
  return { mysql: mysqlConnection, db };
}

// Export a function to get the initialized database
export async function getDatabase(): Promise<DatabaseInstance> {
  if (!databaseInstance) {
    databaseInstance = await createDatabase();
  }
  return databaseInstance;
}
