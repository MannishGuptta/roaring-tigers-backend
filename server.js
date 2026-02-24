const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3002;

server.use(middlewares);
server.use(router);

server.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    time: new Date().toISOString(),
    message: 'Roaring Tigers API is running'
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
});
