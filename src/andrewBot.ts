import Discord from 'discord.js';
import { Parser } from './parser';
import { gotd } from './commands/gotd';
import { createHelp } from './commands/help';
import { info } from './commands/info';
import { createCron, setUpExistingCron } from './commands/cron-gotd';
import { getCronChannel } from './db';

const isProduction = process.env.NODE_ENV === 'production';
const client = new Discord.Client();
const parser = new Parser();

parser.setCommand('info', '!info: Show AndrewBot info', info);
parser.setCommand('gotd', '!gotd: Random Game of the Day', gotd);
parser.setCommand('cron', '!cron: Schedule a gotd', createCron);

if (!isProduction) {
  parser.setCommand('dev', '!dev: Dev Game of the Day', gotd);
}

parser.setCommand('help', '!help: Show available commands', createHelp(parser));

client.on('ready', () => {
  console.log('[discord]> discord client ready');
  setUpCron();
});

client.on('message', message => {
  // don't do anything on bot messages
  if (message.author?.bot) return;

  if (message.content === 'ping') {
    if (message.reply) {
      message.reply('pong');
    }
  }

  const command = parser.parse(message.content);
  if (command && message.channel) {
    command(message.content, message.channel)
      .then(out => {
        message.channel?.send(out);
      })
      .catch(error => {
        console.error(`[discord]> error from command:`, error);
        message.channel?.send(`Bzzzzrt! Failed that command: ${error.message}`);
      });
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

async function setUpCron() {
  const channelId = await getCronChannel();

  if (channelId) {
    console.log('[discord]> setting up cron for channel:', channelId);
    setUpExistingCron(client, channelId.id);
  }
}

export function startServer(token: string) {
  return client.login(token);
}
