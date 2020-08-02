import Discord from 'discord.js';
import { CronJob } from 'cron';
import { gotd } from '../gotd';
import { saveChannelId } from '../../db';

type CronChannel =
  | Discord.TextChannel
  | Discord.DMChannel
  | Discord.NewsChannel;

let jobsStatus: {
  [channelId: string]: CronJob;
} = {};

export async function createCron(
  _rawText: string | null,
  channel: CronChannel
) {
  if (jobsStatus[channel.id]) {
    return `next date is: ${jobsStatus[channel.id]
      .nextDate()
      .toLocaleString()}`;
  }

  async function trySend() {
    try {
      const out = await gotd();
      channel.send(out);
    } catch (error) {
      console.error(`[discord]> error from cron:`, error);
      channel.send(`Bzzzzrt! Failed to cron: ${error.message}`);
    }
  }

  // run at 7am
  const job = new CronJob(
    '0 0 7 * * *',
    () => {
      process.nextTick(trySend);
    },
    null,
    true
  );

  jobsStatus[channel.id] = job;

  saveChannelId(channel.id);

  const next = job.nextDate();
  return next.toLocaleString();
}

export async function setUpExistingCron(
  client: Discord.Client,
  channelId: string
) {
  // cause Channel doesn't have send unless it's a TextChannel or DMChannel
  const channel: any = await client.channels.fetch(channelId);

  async function trySend() {
    try {
      const out = await gotd();
      channel.send(out);
    } catch (error) {
      console.error(`[discord]> error from existing cron:`, error);
      channel.send(`Bzzzzrt! Failed to cron (existing): ${error.message}`);
    }
  }

  // run at 7am (but this is UTC)
  const job = new CronJob(
    '0 0 7 * * *',
    () => {
      process.nextTick(trySend);
    },
    null,
    true
  );

  jobsStatus[channel.id] = job;

  const next = job.nextDate();
  return next.toLocaleString();
}
