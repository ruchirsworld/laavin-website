const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public_html');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.htm': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=UTF-8',
};

const server = http.createServer((req, res) => {
  // Parse URL to avoid query parameters and decode URI components
  let parsedUrl;
  try {
    parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize path
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '\\' || safePath === '/') {
    safePath = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, safePath);

  // Check if target is a directory, append index.html
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // Check file existence
    fs.stat(filePath, (err2, stats2) => {
      // Alias handling: e.g. service.html -> services.html
      if (err2 && safePath.endsWith('/service.html')) {
        const altFilePath = path.join(PUBLIC_DIR, safePath.replace('service.html', 'services.html'));
        if (fs.existsSync(altFilePath)) {
          filePath = altFilePath;
          err2 = null;
        }
      }

      if (err2 || !stats2 || !stats2.isFile()) {
        console.log(`[404] ${req.method} ${pathname} -> File not found`);
        res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;padding:40px;text-align:center;"><h2>404 - Page Not Found</h2><p>The requested file <code>${pathname}</code> was not found.</p><p><a href="/">Back to Home</a></p></body></html>`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      });

      const readStream = fs.createReadStream(filePath);
      readStream.on('error', (streamErr) => {
        console.error(`Stream error for ${filePath}:`, streamErr);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
        }
        res.end('Internal Server Error');
      });

      console.log(`[200] ${req.method} ${pathname} (${contentType})`);
      readStream.pipe(res);
    });
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`  🚀 Laavin Website is running locally!`);
    console.log(`  👉 URL: http://localhost:${port}`);
    console.log(`  📂 Serving from: ${PUBLIC_DIR}`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
