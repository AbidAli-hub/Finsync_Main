// Test the exact email validation logic from the backend
const emailTestCases = [
  'test@example.com',
  ' test@example.com ', // Leading/trailing spaces
  'test@ example.com', // Space in middle
  'test@example .com', // Space in middle
  'test@example.com ',
  ' test@example.com',
  '',
  null,
  undefined,
  'invalid-email',
  'test@',
  '@example.com',
  'test@.com',
  'test@example.',
  'test@example..com',
  'test@@example.com'
];

// Exact validation from routes.ts
function validateEmail(email) {
  console.log(`\nTesting email: "${email}" (type: ${typeof email})`);
  
  // Check if email is present
  if (!email) {
    console.log('❌ Email is missing/null/undefined');
    return false;
  }
  
  // Check if it's a string
  if (typeof email !== 'string') {
    console.log('❌ Email is not a string');
    return false;
  }
  
  // Trim whitespace
  const trimmedEmail = email.trim();
  console.log(`Trimmed email: "${trimmedEmail}"`);
  
  // Check for empty email after trimming
  if (!trimmedEmail) {
    console.log('❌ Email is empty after trimming');
    return false;
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(trimmedEmail);
  
  if (isValid) {
    console.log('✅ Email is valid');
  } else {
    console.log('❌ Email format is invalid');
  }
  
  return isValid;
}

console.log('Testing email validation logic...\n');

let passed = 0;
let failed = 0;

emailTestCases.forEach(email => {
  try {
    const result = validateEmail(email);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  } catch (error) {
    console.log('❌ Error during validation:', error.message);
    failed++;
  }
});

console.log(`\n=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${emailTestCases.length}`);