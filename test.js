const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    message: 'Test server working',
    time: new Date().toISOString()
  }));
});

const port = process.env.PORT || 3002;
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Test server running on port ${port}`);
});
