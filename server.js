const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // Strip query parameters
  const urlPath = req.url.split('?')[0];
  let filePath = urlPath === '/' || urlPath === '' ? './index.html' : '.' + urlPath;
  
  // Resolve path to prevent directory traversal
  const resolvedPath = path.resolve(filePath);
  const rootPath = path.resolve('.');
  
  if (!resolvedPath.startsWith(rootPath)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const serveFile = (pathToSend, mimeType) => {
    fs.readFile(pathToSend, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('File Not Found');
        } else {
          res.statusCode = 500;
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(content);
      }
    });
  };

  if (ext === '') {
    const htmlPath = resolvedPath + '.html';
    fs.readFile(htmlPath, (err, content) => {
      if (!err) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      } else {
        serveFile(resolvedPath, contentType);
      }
    });
  } else {
    serveFile(resolvedPath, contentType);
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
