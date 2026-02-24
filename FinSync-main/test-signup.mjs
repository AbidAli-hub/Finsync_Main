async function testSignup() {
  try {
    console.log('Testing signup with user data:');
    console.log('Username: vamsi');
    console.log('Company: Rasa ai labs');
    console.log('Email: vtu24588@veltech.edu.in');
    console.log('Password: vtu24588');
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'vtu24588@veltech.edu.in',
        password: 'vtu24588',
        name: 'vamsi',
        company: 'Rasa ai labs'
      }),
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Signup successful!');
    } else {
      console.log('❌ Signup failed!');
    }
  } catch (error) {
    console.error('Error during signup test:', error);
  }
}

testSignup();