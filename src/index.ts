import os from 'os';
import { createServer } from 'http';
import { parse } from 'url';

const GIT_SHA = process.env.GIT_SHA;
const GIT_BRANCH = process.env.GIT_BRANCH;
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url!, true);

  if (parsedUrl.pathname === '/ping') {
    res.statusCode = 200;
    res.write('pong');
    res.end();
  } else if (parsedUrl.pathname === '/info') {
    res.setHeader('Content-Type', 'application/json');
    res.write(
      JSON.stringify({
        version: GIT_SHA,
        arch: os.arch,
      })
    );
    res.end();
  } else {
    res.statusCode = 501;
    res.end();
  }
});

console.log(`(${process.pid})> starting server ${GIT_SHA} ${GIT_BRANCH}`);
server.listen(PORT, () => {
  console.log(
    `(${process.pid})> server up on port ${PORT} in ${
      isProduction ? 'production mode' : 'development mode'
    }`
  );
});

function shutdown(forceErrorExit?: boolean) {
  server.close(err => {
    if (err) {
      console.error(`Error shutting down server: ${err.message}`);
      process.exit(2);
    }

    if (forceErrorExit) {
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on('SIGTERM', _signal => {
  console.log(`Process ${process.pid} received a SIGTERM signal`);
  shutdown();
});

process.on('SIGINT', _signal => {
  console.log(`Process ${process.pid} received a SIGINT signal`);
  shutdown();
});

process.on('uncaughtException', err => {
  console.log(`Uncaught Exception: ${err.message}`);
  shutdown(true);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled rejection at ', promise, `reason: ${reason}`);
  shutdown(true);
});
