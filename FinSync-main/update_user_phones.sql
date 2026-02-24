-- Update existing users to have phone numbers if they don't have one
-- This gives each user a unique phone number based on their ID

UPDATE users 
SET phone = CONCAT('+91 ', 
    LPAD(
        (
            SELECT sub.phone_number 
            FROM (
                SELECT 
                    id,
                    CAST(SUBSTR(REPLACE(id, '-', ''), 1, 10) AS UNSIGNED) % 8999999999 + 1000000000 AS phone_number
                FROM users 
                WHERE phone IS NULL OR phone = ''
            ) AS sub 
            WHERE sub.id = users.id
        ), 
        10, 
        '0'
    )
)
WHERE phone IS NULL OR phone = '';