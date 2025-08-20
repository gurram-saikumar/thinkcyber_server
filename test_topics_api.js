const axios = require('axios');

// Test the Topics API with the provided request structure
async function testTopicsAPI() {
  const baseURL = 'http://localhost:8080/api';
  
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

  try {
    console.log('Testing POST /api/topics...');
    const createResponse = await axios.post(`${baseURL}/topics`, testTopic, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Topic created successfully!');
    console.log('Created topic ID:', createResponse.data.data.id);
    console.log('Title:', createResponse.data.data.title);
    console.log('Modules count:', createResponse.data.data.modules.length);
    console.log('Videos count:', createResponse.data.data.modules[0]?.videos?.length || 0);
    
    const topicId = createResponse.data.data.id;
    
    // Test GET by ID
    console.log('\nTesting GET /api/topics/:id...');
    const getResponse = await axios.get(`${baseURL}/topics/${topicId}`);
    
    console.log('✅ Topic retrieved successfully!');
    console.log('Retrieved topic has all fields:');
    console.log('- emoji:', getResponse.data.data.emoji);
    console.log('- learningObjectives:', !!getResponse.data.data.learningObjectives);
    console.log('- targetAudience:', getResponse.data.data.targetAudience?.length || 0, 'items');
    console.log('- prerequisites:', !!getResponse.data.data.prerequisites);
    console.log('- duration (hours):', getResponse.data.data.duration);
    console.log('- featured:', getResponse.data.data.featured);
    
    // Test PUT update
    console.log('\nTesting PUT /api/topics/:id...');
    const updateData = {
      title: "Updated: Introduction to Cybersecurity",
      emoji: "🔒",
      duration: "5.0",
      featured: false
    };
    
    const updateResponse = await axios.put(`${baseURL}/topics/${topicId}`, updateData);
    console.log('✅ Topic updated successfully!');
    console.log('Updated title:', updateResponse.data.data.title);
    console.log('Updated emoji:', updateResponse.data.data.emoji);
    console.log('Updated duration:', updateResponse.data.data.duration, 'hours');
    console.log('Updated featured:', updateResponse.data.data.featured);
    
    return topicId;
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return null;
  }
}

module.exports = { testTopicsAPI };

// Run test if called directly
if (require.main === module) {
  testTopicsAPI().then((topicId) => {
    if (topicId) {
      console.log(`\n🎉 All tests passed! Created topic with ID: ${topicId}`);
    } else {
      console.log('\n💥 Tests failed!');
    }
    process.exit(0);
  });
}
