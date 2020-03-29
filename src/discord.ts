import Discord from 'discord.js';
import { discordInfo } from './info';

const client = new Discord.Client();

client.on('ready', () => {
  console.log('[discord]> discord client ready');
});

client.on('message', message => {
  // don't do anything on bot messages
  if (message.author?.bot) return;

  if (message.content === 'ping') {
    if (message.reply) {
      message.reply('pong');
    }
  }

  if (message.content?.match(/^\!info$/)) {
    message.channel?.send(discordInfo());
  }
});

client.on('error', error => {
  console.log(`[discord]> client error: ${error.message}`);
  console.error(error);
});

client.on('shardError', (error, id) => {
  console.log(`[discord]> shard error: ${error.message} -- id: ${id}`);
  console.error(error);
});

export function startServer(token: string) {
  return client.login(token);
}
