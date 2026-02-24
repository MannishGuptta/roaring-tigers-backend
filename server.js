const http = require('http');

// Hardcoded data
const data = {
  rms: [
    { "id": "1", "name": "Rajesh Kumar", "phone": "9876543210", "email": "rajesh@example.com", "status": "active" },
    { "id": "2", "name": "Priya Sharma", "phone": "9876543211", "email": "priya@example.com", "status": "active" },
    { "id": "3", "name": "Amit Patel", "phone": "9876543212", "email": "amit@example.com", "status": "active" },
    { "id": "4", "name": "Sneha Reddy", "phone": "9876543213", "email": "sneha@example.com", "status": "active" },
    { "id": "5", "name": "Vikram Singh", "phone": "9876543214", "email": "vikram@example.com", "status": "active" },
    { "id": "6", "name": "Deepa Nair", "phone": "9876543215", "email": "deepa@example.com", "status": "active" }
  ]
};

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/rms') {
    res.end(JSON.stringify(data.rms));
  } else if (req.url === '/health') {
    res.end(JSON.stringify({ status: 'OK', time: new Date().toISOString() }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const port = process.env.PORT || 3002;
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📊 Endpoints:`);
  console.log(`   - /rms`);
  console.log(`   - /health`);
});
