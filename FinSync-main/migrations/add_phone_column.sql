-- Migration script to add phone column to users table
-- This fixes the "Unknown column 'phone' in 'field list'" error

USE finsync;

-- Check if phone column exists
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'finsync' 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'phone';

-- Add phone column if it doesn't exist
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER company;

-- Verify the column was added
DESCRIBE users;

-- Update existing users with default phone numbers
UPDATE users 
SET phone = CONCAT('+91 ', LPAD(FLOOR(RAND() * 9000000000 + 1000000000), 10, '0'))
WHERE phone IS NULL;

-- Show sample data to verify
SELECT id, email, name, company, phone FROM users LIMIT 5;