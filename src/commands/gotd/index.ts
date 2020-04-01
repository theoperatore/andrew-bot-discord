import Discord from 'discord.js';
import fetch from 'isomorphic-unfetch';
import { platforms, Platform } from './giantBombPlatforms';

const roundRobin = createRoundRobin(platforms);
const apiKey = process.env.GB_TOKEN;

if (!apiKey) throw new Error('GB_TOKEN must be defined in environment');

function createRoundRobin<T>(allItems: T[]): () => T {
  let cacheIndex = Math.round(Math.random() * (allItems.length - 1));
  return () => {
    const item = { ...allItems[cacheIndex] };
    cacheIndex += 1;

    if (cacheIndex >= allItems.length) {
      cacheIndex = 0;
    }

    return item;
  };
}

const findGameMaxForPlatform = async (platform: Platform) => {
  const response = await fetch(
    `https://www.giantbomb.com/api/games?api_key=${apiKey}&format=json&platforms=${platform.id}&limit=1&field_list=id`,
    {
      headers: {
        'user-agent': 'gotd-1.0.0',
        'Content-Type': 'application/json',
      },
    }
  ).then(r => r.json() as Promise<{ number_of_total_results: number }>);

  if (!response) {
    throw new Error('No response from GiantBomb for max games');
  }

  return response.number_of_total_results;
};

type GameResponse = {
  image: {
    super_url?: string;
    screen_url?: string;
    medium_url?: string;
    small_url?: string;
    thumb_url?: string;
    icon_url?: string;
    tiny_url?: string;
  };
  name: string;
  deck: string;
  description: string;
  original_release_date?: string;
  site_detail_url: string;
  expected_release_day?: string;
  expected_release_month?: string;
  expected_release_year?: string;
  expected_release_quarter?: string;
};

const findRandomGame = async (platform: Platform, gameMax: number) => {
  const offset = Math.round(Math.random() * gameMax);
  const response = await fetch(
    `https://www.giantbomb.com/api/games?api_key=${apiKey}&format=json&platforms=${platform.id}&limit=1&offset=${offset}`,
    {
      headers: {
        'user-agent': 'gotd-2.0.0',
        'Content-Type': 'application/json',
      },
    }
  ).then(r => r.json() as Promise<{ results: GameResponse[] }>);

  if (!response) {
    throw new Error('Failed to get random game from GiantBomb');
  }

  const game = response.results[0];
  if (!game) {
    throw new Error(
      `Undefined results from GB response for offset: ${offset}, with game max: ${gameMax}`
    );
  }

  return game;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en', {
    timeZone: 'UTC',
    month: 'short',
    year: 'numeric',
    day: 'numeric',
  }).format(new Date(date));

const months = [
  'unknown month',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function parseDate(response: GameResponse) {
  const {
    original_release_date,
    expected_release_day,
    expected_release_month,
    expected_release_quarter,
    expected_release_year,
  } = response;
  let date = 'no date listed';

  if (original_release_date) {
    date = formatDate(original_release_date);
  } else if (expected_release_year) {
    if (expected_release_month) {
      if (expected_release_day) {
        const str = `${expected_release_year}-${expected_release_month}-${expected_release_day}`;
        date = formatDate(str);
      } else {
        date = `${
          months[Number(expected_release_month)]
        } ${expected_release_year}`;
      }
    } else if (expected_release_quarter) {
      date = `${expected_release_quarter} ${expected_release_year}`;
    } else {
      date = `${expected_release_year}`;
    }
  }

  return date;
}

function parseImage(response: GameResponse) {
  const { image } = response;
  return `${image.super_url ||
    image.screen_url ||
    image.medium_url ||
    image.small_url ||
    image.thumb_url ||
    image.icon_url ||
    image.tiny_url ||
    ''}`;
}

export async function gotd(): Promise<Discord.MessageEmbed> {
  const platform = roundRobin();
  const maxGames = await findGameMaxForPlatform(platform);
  const game = await findRandomGame(platform, maxGames);
  const image = parseImage(game);
  const date = parseDate(game);

  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(game.name)
    .setAuthor('Game of the Day')
    .setURL(game.site_detail_url)
    .addField('released', date, true)
    .addField('platform', platform.name, true)
    .setDescription(game.deck)
    .setImage(image);
}