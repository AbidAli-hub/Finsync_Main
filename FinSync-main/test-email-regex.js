// Test the exact email validation with better regex
const emailTestCases = [
  'test@example.com',
  'test@example..com', // This should fail but might pass with basic regex
];

function validateEmailBasic(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateEmailStrict(email) {
  // More strict email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

console.log('Testing email validation with different regex patterns...\n');

emailTestCases.forEach(email => {
  console.log(`Email: "${email}"`);
  console.log(`Basic regex result: ${validateEmailBasic(email)}`);
  console.log(`Strict regex result: ${validateEmailStrict(email)}`);
  console.log('---');
});