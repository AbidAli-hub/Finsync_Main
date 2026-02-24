-- Add phone column to users table
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL;

-- Update existing users with placeholder phone numbers based on their user ID
-- This gives each user a unique phone number for testing
UPDATE users 
SET phone = CASE 
    WHEN id IS NOT NULL THEN CONCAT('+91 ', 
        LPAD(
            CONV(
                SUBSTRING(REPLACE(id, '-', ''), 1, 8), 
                16, 
                10
            ) % 10000000000, 
            10, 
            '0'
        )
    )
    ELSE '+91 9876543210'
END
WHERE phone IS NULL;