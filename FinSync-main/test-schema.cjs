const { insertUserSchema } = require('./shared/schema.ts');

// Test data that should be valid
const testData = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User',
  company: 'Test Company',
  phone: '+91 9876543210'
};

console.log('Testing schema validation with data:', testData);

try {
  const result = insertUserSchema.parse(testData);
  console.log('✅ Schema validation passed:', result);
} catch (error) {
  console.error('❌ Schema validation failed:', error.errors);
}