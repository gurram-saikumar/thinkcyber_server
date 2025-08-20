const http = require('http');

// Test the Topics API with the provided request structure
async function testTopicsAPI() {
  const testTopic = {
    "title": "Introduction to Cybersecurity",
    "emoji": "🔐",
    "category": "cybersecurity-fundamentals",
    "subcategory": "basic-security",
    "difficulty": "beginner",
    "duration": "4.5",
    "description": "Learn the fundamentals of cybersecurity and protect yourself online.",
    "learningObjectives": "• Understand basic cybersecurity principles\n• Learn password best practices\n• Identify common security threats",
    "modules": [
      {
        "title": "Introduction Module",
        "description": "Getting started with cybersecurity",
        "order": 1,
        "videos": [
          {
            "title": "Welcome to Cybersecurity",
            "description": "An introduction to the course",
            "duration": "5",
            "videoUrl": "https://example.com/video1.mp4",
            "thumbnail": "https://example.com/thumb1.jpg",
            "order": 1
          }
        ]
      }
    ],
    "isFree": true,
    "price": "0",
    "tags": [
      "cybersecurity",
      "beginner",
      "security"
    ],
    "status": "published",
    "targetAudience": [
      "🏢 Business Owners",
      "👤 General Users"
    ],
    "prerequisites": "Basic computer literacy",
    "thumbnail": "https://example.com/topic-thumb.jpg",
    "metaTitle": "Introduction to Cybersecurity",
    "metaDescription": "Learn cybersecurity fundamentals in this comprehensive course",
    "featured": true
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

    console.log('Testing POST /api/topics...');
    console.log('Request data preview:');
    console.log('- Title:', testTopic.title);
    console.log('- Emoji:', testTopic.emoji);
    console.log('- Category:', testTopic.category);
    console.log('- Subcategory:', testTopic.subcategory);
    console.log('- Modules count:', testTopic.modules.length);
    console.log('- Videos count:', testTopic.modules[0]?.videos?.length || 0);

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
            console.log('Response status:', res.statusCode);
            console.log('Created topic ID:', response.data?.id);
            console.log('Title:', response.data?.title);
            console.log('Emoji:', response.data?.emoji);
            console.log('Category:', response.data?.category);
            console.log('Subcategory:', response.data?.subcategory);
            console.log('Modules count:', response.data?.modules?.length || 0);
            console.log('Videos count:', response.data?.modules?.[0]?.videos?.length || 0);
            console.log('Featured:', response.data?.featured);
            console.log('Duration (hours):', response.data?.duration);
            console.log('Learning objectives:', !!response.data?.learningObjectives);
            console.log('Target audience items:', response.data?.targetAudience?.length || 0);
            console.log('Prerequisites:', !!response.data?.prerequisites);
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

// Run test if called directly
if (require.main === module) {
  testTopicsAPI()
    .then((data) => {
      console.log(`\n🎉 Test completed successfully! Created topic with ID: ${data?.id}`);
      process.exit(0);
    })
    .catch((error) => {
      console.log('\n💥 Test failed!');
      console.log('Error:', error.message);
      process.exit(1);
    });
}

module.exports = { testTopicsAPI };
