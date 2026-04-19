// start.cjs
// Launches frontend (Vite) + backend (nodemon) together.
// Auto-detects your machine's local network IP so you can access
// the app from any device on the same network.
//
// Usage:  node start.cjs
//         npm start

'use strict';

const { networkInterfaces } = require('os');
const { spawn }             = require('child_process');
const { Transform }         = require('stream');
const path                  = require('path');

// ── Detect local IP ───────────────────────────────────────────────────────────
function getLocalIP() {
  const nets = networkInterfaces();
  for (const ifaces of Object.values(nets)) {
    for (const net of ifaces) {
      // Skip internal (127.x) and IPv6
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const ip           = getLocalIP();
const FRONTEND_URL = `http://${ip}:5173`;
const API_URL      = `http://${ip}:3001`;

// ── Banner ────────────────────────────────────────────────────────────────────
console.log('\n\x1b[36m╔════════════════════════════════════════════╗\x1b[0m');
console.log('\x1b[36m║\x1b[0m  \x1b[1m🏥  Care Connect Hub\x1b[0m                       \x1b[36m║\x1b[0m');
console.log('\x1b[36m╠════════════════════════════════════════════╣\x1b[0m');
console.log(`\x1b[36m║\x1b[0m  \x1b[32mLocal   \x1b[0m  http://localhost:5173           \x1b[36m║\x1b[0m`);
console.log(`\x1b[36m║\x1b[0m  \x1b[33mNetwork \x1b[0m  ${FRONTEND_URL.padEnd(32)}\x1b[36m║\x1b[0m`);
console.log(`\x1b[36m║\x1b[0m  \x1b[35mAPI     \x1b[0m  ${API_URL.padEnd(32)}\x1b[36m║\x1b[0m`);
console.log('\x1b[36m╚════════════════════════════════════════════╝\x1b[0m\n');

// ── Spawn helpers ─────────────────────────────────────────────────────────────
const isWindows  = process.platform === 'win32';
const npm        = isWindows ? 'npm.cmd' : 'npm';
const root       = __dirname;
const backendDir = path.join(root, 'backend');

// Prefix every output line with a coloured [tag]
function prefixed(tag, color) {
  return new Transform({
    transform(chunk, _enc, cb) {
      const lines = chunk.toString().split('\n');
      const out = lines
        .map(l => l.trim() ? `${color}[${tag}]\x1b[0m ${l}` : '')
        .filter(Boolean)
        .join('\n');
      if (out) cb(null, out + '\n');
      else     cb();
    },
  });
}

// ── Start backend ─────────────────────────────────────────────────────────────
const backend = spawn(npm, ['run', 'dev'], {
  cwd:   backendDir,
  shell: isWindows,
  env:   {
    ...process.env,
    FRONTEND_URL, // tells the backend which network origin to allow in CORS
  },
});

backend.stdout.pipe(prefixed('backend', '\x1b[35m')).pipe(process.stdout);
backend.stderr.pipe(prefixed('backend', '\x1b[35m')).pipe(process.stderr);

// ── Start frontend ────────────────────────────────────────────────────────────
const frontend = spawn(npm, ['run', 'frontend'], {
  cwd:   root,
  shell: isWindows,
  env:   { ...process.env },
});

frontend.stdout.pipe(prefixed('frontend', '\x1b[36m')).pipe(process.stdout);
frontend.stderr.pipe(prefixed('frontend', '\x1b[36m')).pipe(process.stderr);

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown(reason) {
  console.log(`\n\x1b[33m[start] ${reason} — stopping both processes…\x1b[0m`);
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  // Force-kill after 3 s if they haven't stopped
  setTimeout(() => {
    try { backend.kill('SIGKILL'); }  catch {}
    try { frontend.kill('SIGKILL'); } catch {}
    process.exit(0);
  }, 3000).unref();
}

process.on('SIGINT',  () => shutdown('SIGINT (Ctrl+C)'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

backend.on('close', code => {
  if (code !== null && code !== 0) {
    console.error(`\x1b[31m[backend] exited with code ${code}\x1b[0m`);
    shutdown('backend crashed');
  }
});

frontend.on('close', code => {
  if (code !== null && code !== 0) {
    console.error(`\x1b[31m[frontend] exited with code ${code}\x1b[0m`);
    shutdown('frontend crashed');
  }
});
