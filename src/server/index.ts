import { createServer, DiscordOutboundMessage } from './server';
import { channel, take } from './csp';

const { DISCORD_BOT_TOKEN } = process.env;

const infoChannel = channel<any>();
const outbound = channel<DiscordOutboundMessage>();

async function main() {
  const server = createServer({
    token: DISCORD_BOT_TOKEN || '',
    outbound,
  });

  server.command('info', infoChannel);

  await server.start();
  console.log('> ready');
}

main();
handleInfo();

async function handleInfo() {
  while (true) {
    const msg = await take(infoChannel);
    console.log('info message', msg);
  }
}
