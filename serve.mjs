// Tiny static server for previewing dist/ locally: node serve.mjs → http://localhost:8080
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("dist");
const port = Number(process.env.PORT) || 8080;
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".webp": "image/webp", ".gif": "image/gif", ".png": "image/png", ".jpg": "image/jpeg",
  ".ics": "text/calendar; charset=utf-8", ".svg": "image/svg+xml",
};

http.createServer((req, res) => {
  let p = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(root)) return res.writeHead(403).end();
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  fs.readFile(p, (err, buf) => {
    if (err) return res.writeHead(404).end("not found");
    res.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" }).end(buf);
  });
}).listen(port, () => console.log(`http://localhost:${port}`));
