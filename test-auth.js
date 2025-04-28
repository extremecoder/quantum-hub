const axios = require('axios');

async function testAuth() {
  try {
    // Login to get a token
    const loginResponse = await axios.post('http://localhost:8001/api/v1/auth/login', 
      'username=testuser999&password=password123',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('Login response:', loginResponse.data);
    
    const token = loginResponse.data.access_token;
    
    // Fetch quantum apps with the token
    const appsResponse = await axios.get('http://localhost:8005/api/v1/quantum-apps', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Quantum apps response:', appsResponse.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testAuth();
