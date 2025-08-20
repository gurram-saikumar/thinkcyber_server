const http = require('http');

// Test with actual category/subcategory names that exist in the database
async function testWithMatchingCategories() {
  const testTopic = {
    "title": "Network Security Fundamentals",
    "emoji": "🔒", 
    "category": "Cybersecurity Fundamentals", // Exact match
    "subcategory": "Network Protocolss", // Exact match (note the double 's')
    "difficulty": "beginner",
    "duration": "3.0",
    "description": "Learn network security fundamentals",
    "learningObjectives": "• Understand network protocols\n• Learn firewall basics\n• Network monitoring",
    "modules": [
      {
        "title": "Network Basics",
        "description": "Understanding network fundamentals",
        "order": 1,
        "videos": [
          {
            "title": "TCP/IP Introduction",
            "description": "Learn about TCP/IP protocol",
            "duration": "10",
            "videoUrl": "https://example.com/video2.mp4",
            "order": 1
          }
        ]
      }
    ],
    "isFree": false,
    "price": "99.99",
    "tags": ["networking", "security", "protocols"],
    "status": "published",
    "targetAudience": ["🎓 Students", "💼 IT Professionals"],
    "prerequisites": "Basic networking knowledge",
    "thumbnail": "https://example.com/network-thumb.jpg",
    "featured": false
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testTopic);
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/topics',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('Testing POST /api/topics with matching categories...');
    console.log('Request data:');
    console.log('- Title:', testTopic.title);
    console.log('- Category:', testTopic.category);
    console.log('- Subcategory:', testTopic.subcategory);
    console.log('- Price:', testTopic.price);

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 201) {
            console.log('\n✅ Topic created successfully!');
            console.log('Created topic ID:', response.data?.id);
            console.log('Title:', response.data?.title);
            console.log('Category ID:', response.data?.categoryId);
            console.log('Category slug:', response.data?.category);
            console.log('Subcategory ID:', response.data?.subcategoryId);
            console.log('Subcategory slug:', response.data?.subcategory);
            console.log('Price:', response.data?.price);
            console.log('Featured:', response.data?.featured);
            console.log('Duration (hours):', response.data?.duration);
            resolve(response.data);
          } else {
            console.log('\n❌ Topic creation failed!');
            console.log('Status:', res.statusCode);
            console.log('Response:', response);
            reject(new Error(`HTTP ${res.statusCode}: ${response.error || 'Unknown error'}`));
          }
        } catch (err) {
          console.log('\n❌ Failed to parse response!');
          console.log('Status:', res.statusCode);
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

    req.write(postData);
    req.end();
  });
}

// Run test
testWithMatchingCategories()
  .then((data) => {
    console.log(`\n🎉 Test completed! Topic ID: ${data?.id}`);
    console.log('Category matching worked:', data?.categoryId ? 'YES' : 'NO');
    console.log('Subcategory matching worked:', data?.subcategoryId ? 'YES' : 'NO');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Test failed!');
    console.log('Error:', error.message);
    process.exit(1);
  });
