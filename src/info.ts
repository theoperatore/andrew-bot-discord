import os from 'os';
import Discord from 'discord.js';

const version = '1.0.5';
const GIT_SHA = process.env.GIT_SHA;

export function info() {
  return {
    version,
    git_version: GIT_SHA,
    arch: os.arch(),
    freemem: os.freemem(),
    totalmem: os.totalmem(),
    usedmem: `${(
      ((os.totalmem() - os.freemem()) / os.totalmem()) *
      100
    ).toFixed(2)}`,
  };
}

export function discordInfo() {
  const { version, git_version, arch, freemem, totalmem, usedmem } = info();
  return new Discord.MessageEmbed()
    .setAuthor('AndrewBot')
    .setColor('#333333')
    .setDescription('Technical information about AndrewBot and his well-being')
    .addField('version', version, true)
    .addField('git_version', git_version, true)
    .addField('arch', arch, true)
    .addField('freemem (kb)', freemem / 1024, true)
    .addField('totalmem (kb)', totalmem / 1024, true)
    .addField('usedmem (%)', usedmem, true);
}
