const http = require('http');

// Test GET request for topic 5
async function testGetTopic() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/topics/5',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    console.log('Testing GET /api/topics/5...');

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('\n✅ GET successful!');
            console.log('Topic data:');
            console.log('- ID:', response.data?.id);
            console.log('- Title:', response.data?.title);
            console.log('- categoryId:', response.data?.categoryId);
            console.log('- subcategoryId:', response.data?.subcategoryId);
            console.log('- category (should be ID string):', response.data?.category);
            console.log('- subcategory (should be ID string):', response.data?.subcategory);
            console.log('- categoryName:', response.data?.categoryName);
            console.log('- subcategoryName:', response.data?.subcategoryName);
            console.log('- duration:', response.data?.duration);
            console.log('- modules count:', response.data?.modules?.length || 0);
            resolve(response.data);
          } else {
            console.log('\n❌ GET failed!');
            console.log('Response:', response);
            reject(new Error(`HTTP ${res.statusCode}: ${response.error || 'Unknown error'}`));
          }
        } catch (err) {
          console.log('\n❌ Failed to parse response!');
          console.log('Raw response:', data);
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      console.log('\n❌ Request failed!');
      console.log('Error:', err.message);
      reject(err);
    });

    req.end();
  });
}

// Run test
testGetTopic()
  .then((data) => {
    console.log(`\n🎉 Test completed!`);
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Test failed!');
    console.log('Error:', error.message);
    process.exit(1);
  });
