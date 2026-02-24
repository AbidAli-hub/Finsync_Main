// Simple test to verify form data collection
const testFormData = () => {
  // Simulate form data that should be sent
  const formData = {
    email: 'test@example.com',
    password: 'testpassword',
    name: 'Test User',
    company: 'Test Company',
    phone: '+91 9876543210'
  };
  
  console.log('Testing form data structure:');
  console.log('Email:', formData.email, typeof formData.email);
  console.log('Password:', formData.password, typeof formData.password);
  console.log('Name:', formData.name, typeof formData.name);
  console.log('Company:', formData.company, typeof formData.company);
  console.log('Phone:', formData.phone, typeof formData.phone);
  
  // Test stringifying the data
  const jsonString = JSON.stringify(formData);
  console.log('Stringified data:', jsonString);
  
  // Test parsing the data
  const parsedData = JSON.parse(jsonString);
  console.log('Parsed data:', parsedData);
};

testFormData();