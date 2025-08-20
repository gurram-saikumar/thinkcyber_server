const http = require('http');

// Test PUT request with your exact data
async function testPutUpdate() {
  const updateData = {
    "title": "Basic Security",
    "slug": "basic-security",
    "emoji": "🔐",
    "category": "7",  // This is a string ID, not a category name
    "subcategory": "2", // This is a string ID, not a subcategory name
    "difficulty": "beginner",
    "duration": "8.5",
    "description": "Basic cybersecurity refers to the fundamental practices and measures that individuals and organizations should follow to protect systems, data, and networks from unauthorized access, damage, or theft.\nHere's a simple breakdown:\n🔐 Core Principles of Basic Cybersecurity\nConfidentiality – Keep data private and accessible only to authorized users.\nIntegrity – Ensure information is not altered or tampered with.\nAvailability – Ensure systems and data are accessible when needed",
    "learningObjectives": "Key Practices of Basic Cybersecurity\n\n\n| Practice | What It Means | Why It Matters |\n|----------|----------|----------|\n| **Use strong passwords** | Complex, unique passwords for each account | Prevents easy account hacks |\n| **Enable multi-factor authentication (MFA)** | Adds a second step (e.g., phone or token) to log in | Stops attackers even if password is stolen |\n| **Keep software up to date** | Regularly install security updates/patches | Fixes known security holes attackers exploit |\n| **Use antivirus/anti-malware software** | Detects and blocks malicious software | Protects devices from being infected |\n| **Avoid suspicious links/emails** | Don't click unknown attachments or links | Prevents phishing and malware infections |\n| **Back up important data** | Save copies of your files in a secure place | Helps recover data after ransomware or failures |\n| **Limit user access** | Only give access to those who truly need it | Reduces risk of misuse or insider threats |\n| **Secure your Wi-Fi** | Use strong passwords and encryption (WPA2/WPA3) | Prevents unauthorized access to your network |\n\n",
    "modules": [
      {
        "id": 5,
        "title": "Security and Risk Management",
        "description": "Security and Risk Management is a critical area that focuses on safeguarding an organization's assets, information, and systems from potential threats while managing the risks associated with security breaches. Here are the main concepts from a security perspective:\n",
        "order": 1,
        "orderIndex": 1,
        "durationMinutes": 0,
        "isActive": true,
        "videos": [
          {
            "id": 7,
            "title": "Security and Risk Management",
            "description": "",
            "duration": "15",
            "videoUrl": "https://www.youtube.com/watch?v=kQ7x-ivnG5o&t=2s",
            "thumbnail": "",
            "thumbnailUrl": null,
            "order": 1,
            "orderIndex": 1,
            "videoType": "mp4",
            "durationSeconds": 900,
            "isPreview": false,
            "transcript": null
          }
        ]
      }
    ],
    "isFree": true,
    "price": "0",
    "tags": [],
    "status": "published",
    "targetAudience": ["👨‍👩‍👧‍👦 Parents", "🧒 Children", "👨‍💻 Developers"],
    "prerequisites": "Basic Security",
    "thumbnail": "https://www.kiteworks.com/wp-content/uploads/2022/01/Cybersecurity-Risk-Management-Glossary.webp",
    "metaTitle": "Basic Security",
    "metaDescription": "Security and Risk Management is a critical area that focuses on safeguarding an organization's assets, information, and systems from potential threats while managing the risks associated with securShow more"
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(updateData);
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/topics/5',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('Testing PUT /api/topics/5...');
    console.log('Update data preview:');
    console.log('- Title:', updateData.title);
    console.log('- Category (string ID):', updateData.category);
    console.log('- Subcategory (string ID):', updateData.subcategory);
    console.log('- Duration:', updateData.duration);
    console.log('- Emoji:', updateData.emoji);

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\nResponse Status:', res.statusCode);
        console.log('Response Headers:', res.headers);
        
        try {
          const response = JSON.parse(data);
          console.log('Response Data:', JSON.stringify(response, null, 2));
          
          if (res.statusCode === 200) {
            console.log('\n✅ Update successful!');
            resolve(response.data);
          } else {
            console.log('\n❌ Update failed!');
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

    req.write(postData);
    req.end();
  });
}

// Run test
testPutUpdate()
  .then((data) => {
    console.log(`\n🎉 Test completed!`);
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Test failed!');
    console.log('Error:', error.message);
    process.exit(1);
  });
