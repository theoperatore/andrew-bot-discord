import { createServer } from 'http';
import { parse } from 'url';
import { info } from './info';

const GIT_SHA = process.env.GIT_SHA;
const GIT_BRANCH = process.env.GIT_BRANCH;
const isProduction = process.env.NODE_ENV === 'production';

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url!, true);

  if (parsedUrl.pathname === '/_ping') {
    res.writeHead(200, 'pong');
    res.end();
  } else if (parsedUrl.pathname === '/_info') {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(info()));
    res.end();
  } else {
    res.statusCode = 501;
    res.end();
  }
});

export function startServer(port: string | number) {
  return new Promise<void>(resolve => {
    console.log(`[api]> starting server ${GIT_SHA} ${GIT_BRANCH}`);
    server.listen(port, () => {
      console.log(
        `[api]> server up on port ${port} in ${
          isProduction ? 'production mode' : 'development mode'
        }`
      );
      resolve();
    });
  });
}

function shutdown(forceErrorExit?: boolean) {
  server.close(err => {
    if (err) {
      console.error(`[api]> Error shutting down server: ${err.message}`);
      process.exit(2);
    }

    if (forceErrorExit) {
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on('SIGTERM', _signal => {
  shutdown();
});

process.on('SIGINT', _signal => {
  shutdown();
});

process.on('uncaughtException', err => {
  console.log(`[api]> Uncaught Exception: ${err.message}`);
  shutdown(true);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('[api]> Unhandled rejection at ', promise, `reason: ${reason}`);
  shutdown(true);
});
