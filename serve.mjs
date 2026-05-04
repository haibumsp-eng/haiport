import { createServer } from 'http';
import { createReadStream, stat as fsStat } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const mime = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.mp4':  'video/mp4',
  '.mov':  'video/quicktime',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.json': 'application/json',
};

const server = createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath    = join(__dirname, urlPath);
  const ext         = extname(filePath).toLowerCase();
  const contentType = mime[ext] || 'application/octet-stream';

  fsStat(filePath, (err, stat) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }

    const total = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse "bytes=start-end"
      const [, startStr, endStr] = range.match(/bytes=(\d*)-(\d*)/) || [];
      const start  = startStr ? parseInt(startStr, 10) : 0;
      const end    = endStr   ? parseInt(endStr,   10) : total - 1;
      const chunk  = end - start + 1;

      res.writeHead(206, {
        'Content-Range':  `bytes ${start}-${end}/${total}`,
        'Accept-Ranges':  'bytes',
        'Content-Length': chunk,
        'Content-Type':   contentType,
      });
      createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': total,
        'Content-Type':   contentType,
        'Accept-Ranges':  'bytes',
        'Cache-Control':  'no-cache',
      });
      createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(3000, () => console.log('→ http://localhost:3000'));
