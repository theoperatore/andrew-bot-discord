import os from 'os';
import { createServer } from 'http';
import { parse } from 'url';
import Discord from 'discord.js';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GIT_SHA = process.env.GIT_SHA;
const GIT_BRANCH = process.env.GIT_BRANCH;
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url!, true);

  if (parsedUrl.pathname === '/ping') {
    res.writeHead(200, 'pong');
    res.end();
  } else if (parsedUrl.pathname === '/info') {
    res.setHeader('Content-Type', 'application/json');
    res.write(
      JSON.stringify({
        version: '1.0.3',
        git_version: GIT_SHA,
        arch: os.arch(),
        token: !!DISCORD_BOT_TOKEN,
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

const client = new Discord.Client();

client.on('ready', () => {
  console.log('> discord client ready');
});

client.on('message', message => {
  // don't do anything on bot messages
  if (message.author?.bot) return;

  console.log(
    '> got message from',
    message.author?.username,
    ':',
    message.content,
    message.channel?.id
  );

  if (message.content === 'ping') {
    if (message.reply) {
      message.reply('pong');
    }
  }
});

client.on('error', error => {
  console.log(`discord client error: ${error.message}`);
  console.error(error);
});

client.on('shardError', (error, id) => {
  console.log(`discord shard error: ${error.message} -- id: ${id}`);
  console.error(error);
});

client.login(DISCORD_BOT_TOKEN);
