const axios = require('axios');
const { parse } = require('cookie');

async function testSessionToken() {
  try {
    // Login through the proxy endpoint
    const loginResponse = await axios.post('http://localhost:3001/api/proxy/token', {
      username: 'testuser999',
      password: 'password123'
    });
    
    console.log('Login response:', loginResponse.data);
    
    // Check if the response contains a token
    if (loginResponse.data.access_token) {
      console.log('Token found in response');
      
      // Check if the response contains cookies
      const cookies = loginResponse.headers['set-cookie'];
      if (cookies) {
        console.log('Cookies found in response');
        
        // Parse the cookies
        cookies.forEach(cookie => {
          console.log('Cookie:', cookie);
          const parsedCookie = parse(cookie);
          console.log('Parsed cookie:', parsedCookie);
        });
      } else {
        console.log('No cookies found in response');
      }
    } else {
      console.log('No token found in response');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testSessionToken();
