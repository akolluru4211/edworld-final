const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 5000;
const CLIENT_DIST = path.join(__dirname, 'client', 'dist');

// MIME types for static client files
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.jsx': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = req.url.split('?')[0];

  // API Endpoints
  if (parsedUrl === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'healthy',
      platform: 'EdWorld Co. Career Operating System API',
      version: '2.0.0',
      timestamp: new Date().toISOString()
    });
  }

  // Serve static files from client/dist if present
  if (fs.existsSync(CLIENT_DIST)) {
    let filePath = path.join(CLIENT_DIST, parsedUrl === '/' ? 'index.html' : parsedUrl);
    
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(CLIENT_DIST, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        return sendJson(res, 500, { error: 'Internal Server Error' });
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
    return;
  }

  // API Fallback
  if (parsedUrl.startsWith('/api/')) {
    return sendJson(res, 404, { error: 'API endpoint not found' });
  }

  // Dev mode notice
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <body style="background:#090d16;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="text-align:center;">
          <h1 style="color:#6366f1;">EdWorld Co. Backend Active</h1>
          <p style="color:#94a3b8;">Run Vite client on port 5173 for development or build client for production.</p>
          <a href="/api/health" style="color:#06b6d4;">Check API Health</a>
        </div>
      </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 EdWorld Co. Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});
