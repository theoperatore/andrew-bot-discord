import Discord from 'discord.js';
import { CronJob } from 'cron';
import { gotd } from '../gotd';

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

  const next = job.nextDate();
  return next.toLocaleString();
}
