const http = require('http');

// Complete hardcoded data
const data = {
  rms: [
    { "id": "1", "name": "Rajesh Kumar", "phone": "9876543210", "email": "rajesh@example.com", "status": "active" },
    { "id": "2", "name": "Priya Sharma", "phone": "9876543211", "email": "priya@example.com", "status": "active" },
    { "id": "3", "name": "Amit Patel", "phone": "9876543212", "email": "amit@example.com", "status": "active" },
    { "id": "4", "name": "Sneha Reddy", "phone": "9876543213", "email": "sneha@example.com", "status": "active" },
    { "id": "5", "name": "Vikram Singh", "phone": "9876543214", "email": "vikram@example.com", "status": "active" },
    { "id": "6", "name": "Deepa Nair", "phone": "9876543215", "email": "deepa@example.com", "status": "active" }
  ],
  channel_partners: [],
  meetings: [],
  sales: [],
  targets: []
};

const server = http.createServer((req, res) => {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Set content type for all responses
  res.setHeader('Content-Type', 'application/json');

  // Route handling
  if (req.url === '/health') {
    res.end(JSON.stringify({ 
      status: 'OK', 
      time: new Date().toISOString() 
    }));
  } 
  else if (req.url === '/rms') {
    res.end(JSON.stringify(data.rms));
  }
  else if (req.url === '/channel_partners') {
    res.end(JSON.stringify(data.channel_partners));
  }
  else if (req.url === '/meetings') {
    res.end(JSON.stringify(data.meetings));
  }
  else if (req.url === '/sales') {
    res.end(JSON.stringify(data.sales));
  }
  else if (req.url === '/targets') {
    res.end(JSON.stringify(data.targets));
  }
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ 
      error: 'Not found',
      message: 'Available endpoints: /health, /rms, /channel_partners, /meetings, /sales, /targets'
    }));
  }
});

const port = process.env.PORT || 3002;
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - /health`);
  console.log(`   - /rms`);
  console.log(`   - /channel_partners`);
  console.log(`   - /meetings`);
  console.log(`   - /sales`);
  console.log(`   - /targets`);
});
