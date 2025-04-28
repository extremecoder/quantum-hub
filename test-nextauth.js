const axios = require('axios');

async function testNextAuth() {
  try {
    // Login through the NextAuth endpoint
    const loginResponse = await axios.post('http://localhost:3001/api/auth/callback/credentials', {
      username: 'testuser999',
      password: 'password123',
      redirect: false,
      callbackUrl: 'http://localhost:3001/dashboard'
    });
    
    console.log('Login response:', loginResponse.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testNextAuth();
