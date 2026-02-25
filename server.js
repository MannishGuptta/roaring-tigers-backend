const http = require('http');

// Complete hardcoded data with passwords
let data = {
  rms: [
    { "id": "1", "name": "Rajesh Kumar", "phone": "9876543210", "email": "rajesh@example.com", "password": "rm123", "status": "active" },
    { "id": "2", "name": "Priya Sharma", "phone": "9876543211", "email": "priya@example.com", "password": "rm123", "status": "active" },
    { "id": "3", "name": "Amit Patel", "phone": "9876543212", "email": "amit@example.com", "password": "rm123", "status": "active" },
    { "id": "4", "name": "Sneha Reddy", "phone": "9876543213", "email": "sneha@example.com", "password": "rm123", "status": "active" },
    { "id": "5", "name": "Vikram Singh", "phone": "9876543214", "email": "vikram@example.com", "password": "rm123", "status": "active" },
    { "id": "6", "name": "Deepa Nair", "phone": "9876543215", "email": "deepa@example.com", "password": "rm123", "status": "active" }
  ],
  channel_partners: [],
  meetings: [],
  sales: [],
  targets: []
};

const server = http.createServer((req, res) => {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests (sent by browser before PUT/DELETE)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  
  // Helper function to send response
  const sendResponse = (statusCode, responseData) => {
    res.statusCode = statusCode;
    res.end(JSON.stringify(responseData));
  };

  // Parse URL to get path and ID
  const urlParts = req.url.split('/');
  const resource = urlParts[1]; // e.g., 'rms', 'channel_partners'
  const id = urlParts[2]; // e.g., '1', '2' (for PUT/DELETE)

  // Route handling
  if (req.url === '/health') {
    sendResponse(200, { status: 'OK', time: new Date().toISOString() });
  } 
  else if (resource === 'rms') {
    if (req.method === 'GET') {
      if (id) {
        // Get single RM by ID
        const rm = data.rms.find(rm => String(rm.id) === id);
        if (rm) {
          sendResponse(200, rm);
        } else {
          sendResponse(404, { error: 'RM not found' });
        }
      } else {
        // Get all RMs
        sendResponse(200, data.rms);
      }
    }
    else if (req.method === 'POST') {
      // Add new RM
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const newRM = JSON.parse(body);
          // Generate a new ID (simple approach)
          const newId = (Math.max(...data.rms.map(r => parseInt(r.id))) + 1).toString();
          const rmToAdd = { id: newId, ...newRM };
          data.rms.push(rmToAdd);
          sendResponse(201, rmToAdd);
        } catch (error) {
          sendResponse(400, { error: 'Invalid JSON' });
        }
      });
    }
    else if (req.method === 'PUT') {
      if (!id) {
        sendResponse(400, { error: 'ID is required for PUT request' });
        return;
      }
      // Update existing RM
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const updatedData = JSON.parse(body);
          const rmIndex = data.rms.findIndex(rm => String(rm.id) === id);
          if (rmIndex !== -1) {
            // Keep the original ID
            data.rms[rmIndex] = { id: id, ...updatedData };
            sendResponse(200, data.rms[rmIndex]);
          } else {
            sendResponse(404, { error: 'RM not found' });
          }
        } catch (error) {
          sendResponse(400, { error: 'Invalid JSON' });
        }
      });
    }
    else if (req.method === 'DELETE') {
      if (!id) {
        sendResponse(400, { error: 'ID is required for DELETE request' });
        return;
      }
      const rmIndex = data.rms.findIndex(rm => String(rm.id) === id);
      if (rmIndex !== -1) {
        data.rms.splice(rmIndex, 1);
        sendResponse(200, { message: 'RM deleted successfully' });
      } else {
        sendResponse(404, { error: 'RM not found' });
      }
    }
    else {
      sendResponse(405, { error: 'Method not allowed' });
    }
  }
  else if (resource === 'channel_partners') {
    // Similar CRUD operations can be added for channel_partners
    if (req.method === 'GET') {
      sendResponse(200, data.channel_partners);
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const newCP = JSON.parse(body);
          const newId = (data.channel_partners.length + 1).toString();
          const cpToAdd = { id: newId, ...newCP };
          data.channel_partners.push(cpToAdd);
          sendResponse(201, cpToAdd);
        } catch (error) {
          sendResponse(400, { error: 'Invalid JSON' });
        }
      });
    } else {
      sendResponse(405, { error: 'Method not allowed' });
    }
  }
  else if (resource === 'meetings') {
    if (req.method === 'GET') {
      sendResponse(200, data.meetings);
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const newMeeting = JSON.parse(body);
          const newId = (data.meetings.length + 1).toString();
          const meetingToAdd = { id: newId, ...newMeeting };
          data.meetings.push(meetingToAdd);
          sendResponse(201, meetingToAdd);
        } catch (error) {
          sendResponse(400, { error: 'Invalid JSON' });
        }
      });
    } else {
      sendResponse(405, { error: 'Method not allowed' });
    }
  }
  else if (resource === 'sales') {
    if (req.method === 'GET') {
      sendResponse(200, data.sales);
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const newSale = JSON.parse(body);
          const newId = (data.sales.length + 1).toString();
          const saleToAdd = { id: newId, ...newSale };
          data.sales.push(saleToAdd);
          sendResponse(201, saleToAdd);
        } catch (error) {
          sendResponse(400, { error: 'Invalid JSON' });
        }
      });
    } else {
      sendResponse(405, { error: 'Method not allowed' });
    }
  }
  else if (resource === 'targets') {
    if (req.method === 'GET') {
      sendResponse(200, data.targets);
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const newTarget = JSON.parse(body);
          const newId = (data.targets.length + 1).toString();
          const targetToAdd = { id: newId, ...newTarget };
          data.targets.push(targetToAdd);
          sendResponse(201, targetToAdd);
        } catch (error) {
          sendResponse(400, { error: 'Invalid JSON' });
        }
      });
    } else {
      sendResponse(405, { error: 'Method not allowed' });
    }
  }
  else {
    sendResponse(404, { 
      error: 'Not found',
      message: 'Available endpoints: /health, /rms, /channel_partners, /meetings, /sales, /targets'
    });
  }
});

const port = process.env.PORT || 3002;
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - /health`);
  console.log(`   - /rms (with full CRUD!)`);
  console.log(`   - /channel_partners`);
  console.log(`   - /meetings`);
  console.log(`   - /sales`);
  console.log(`   - /targets`);
  console.log(`🌐 CORS enabled for all origins`);
});
