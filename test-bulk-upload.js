const http = require('http');
const FormData = require('form-data');
const fs = require('fs');

async function testBulkVideoUpload() {
  try {
    // Create test files
    fs.writeFileSync('test-video1.mp4', 'test video content 1');
    fs.writeFileSync('test-video2.mp4', 'test video content 2');

    const form = new FormData();
    form.append('videos', fs.createReadStream('test-video1.mp4'));
    form.append('videos', fs.createReadStream('test-video2.mp4'));
    form.append('titles', 'First Test Video');
    form.append('titles', 'Second Test Video');
    form.append('descriptions', 'First video description');
    form.append('descriptions', 'Second video description');
    form.append('durations', '3');
    form.append('durations', '4');
    form.append('orders', '1');
    form.append('orders', '2');

    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/topics/6/modules/12/videos/upload-multiple',
      method: 'POST',
      headers: form.getHeaders()
    };

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Bulk Upload Response:', data);
        // Clean up
        fs.unlinkSync('test-video1.mp4');
        fs.unlinkSync('test-video2.mp4');
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      // Clean up
      if (fs.existsSync('test-video1.mp4')) fs.unlinkSync('test-video1.mp4');
      if (fs.existsSync('test-video2.mp4')) fs.unlinkSync('test-video2.mp4');
    });

    form.pipe(req);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testBulkVideoUpload();
