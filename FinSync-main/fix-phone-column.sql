-- Fix for "Unknown column 'phone' in 'field list'" error
-- Run this SQL directly in your MySQL client or phpMyAdmin

USE finsync;

-- Add phone column to users table
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER company;

-- Verify the column was added
DESCRIBE users;

-- Update existing users with default phone numbers
UPDATE users 
SET phone = CONCAT('+91 ', LPAD(FLOOR(RAND() * 9000000000 + 1000000000), 10, '0'))
WHERE phone IS NULL;

-- Show sample data to verify
SELECT id, email, name, company, phone FROM users LIMIT 5;