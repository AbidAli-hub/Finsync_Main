-- Create FinSync MySQL Database Tables
USE finsync;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  avatar TEXT,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- GST Returns table
CREATE TABLE IF NOT EXISTS gst_returns (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  return_type VARCHAR(50) NOT NULL,
  period VARCHAR(20) NOT NULL,
  status VARCHAR(50) NOT NULL,
  total_tax VARCHAR(50),
  filed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  gstin VARCHAR(50),
  buyer_name VARCHAR(255),
  amount VARCHAR(50),
  tax_amount VARCHAR(50),
  hsn_code VARCHAR(50),
  status VARCHAR(50) DEFAULT 'processed',
  file_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Uploaded Files table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size VARCHAR(50),
  file_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'processing',
  extracted_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Download History table
CREATE TABLE IF NOT EXISTS download_history (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL DEFAULT 'excel',
  invoices_count VARCHAR(20) DEFAULT '0',
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_size VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Display created tables
SHOW TABLES;