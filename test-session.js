const axios = require('axios');

async function testSession() {
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
    
    // Make a request to the token proxy endpoint
    const proxyResponse = await axios.post('http://localhost:3001/api/proxy/token', {
      username: 'testuser999',
      password: 'password123'
    });
    
    console.log('Proxy response:', proxyResponse.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testSession();
