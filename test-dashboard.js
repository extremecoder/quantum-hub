const axios = require('axios');

async function testDashboard() {
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
    
    const token = loginResponse.data.access_token;
    
    // Fetch quantum apps with the token
    const appsResponse = await axios.get('http://localhost:8005/api/v1/quantum-apps', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Quantum apps response:', appsResponse.data);
    
    // Check if the response is an array
    if (Array.isArray(appsResponse.data)) {
      console.log('Response is an array with', appsResponse.data.length, 'items');
      
      // Check the status field
      if (appsResponse.data.length > 0) {
        console.log('First item status:', appsResponse.data[0].status);
        console.log('First item status type:', typeof appsResponse.data[0].status);
        if (Array.isArray(appsResponse.data[0].status)) {
          console.log('Status is an array with', appsResponse.data[0].status.length, 'items');
        }
      }
    } else {
      console.log('Response is not an array');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testDashboard();
