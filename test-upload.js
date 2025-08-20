const http = require('http');
const FormData = require('form-data');
const fs = require('fs');

async function testVideoUpload() {
  try {
    // Create a test file
    fs.writeFileSync('test-video.mp4', 'test video content');

    const form = new FormData();
    form.append('video', fs.createReadStream('test-video.mp4'));
    form.append('title', 'Test Video Upload');
    form.append('description', 'Testing video upload functionality');
    form.append('duration', '5');
    form.append('order', '1');

    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/topics/6/modules/12/videos/upload',
      method: 'POST',
      headers: form.getHeaders()
    };

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response:', data);
        // Clean up
        fs.unlinkSync('test-video.mp4');
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      // Clean up
      if (fs.existsSync('test-video.mp4')) {
        fs.unlinkSync('test-video.mp4');
      }
    });

    form.pipe(req);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testVideoUpload();
