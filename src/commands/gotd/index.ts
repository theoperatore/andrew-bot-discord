import Discord from 'discord.js';
import fetch from 'isomorphic-unfetch';
import { getGame, saveGame } from '../../db';

type GameImage = {
  super_url?: string;
  screen_url?: string;
  medium_url?: string;
  small_url?: string;
  thumb_url?: string;
  icon_url?: string;
  tiny_url?: string;
};

type Game = {
  id: number;
  image: GameImage;
  name: string;
  deck: string | null;
  description: string | null;
  original_release_date?: string;
  site_detail_url: string;
  expected_release_day?: string | null;
  expected_release_month?: string | null;
  expected_release_year?: string | null;
  expected_release_quarter?: string | null;
  platforms: {
    api_detail_url: string;
    id: number;
    name: string;
    site_detail_url: string;
    abbreviation: string;
  }[];
};

const formatDate = (date: string | number) =>
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

function parseDate(response: Game) {
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

function parseImage(response: Game) {
  const { image } = response;
  return `${
    image.super_url ||
    image.screen_url ||
    image.medium_url ||
    image.small_url ||
    image.thumb_url ||
    image.icon_url ||
    image.tiny_url ||
    ''
  }`;
}

type AlorgResponse = {
  status: 'OK' | 'ERROR';
  result: Game | string; // error message
};

async function findRandomGame() {
  const response = await fetch('https://datas.alorg.net/api/v1/games/random');
  const parsed = (await response.json()) as AlorgResponse;
  if (parsed.status === 'ERROR')
    throw new Error(`AlorgClient: ${parsed.result}`);
  return parsed.result as Game;
}

export async function gotd(): Promise<Discord.MessageEmbed> {
  const game = await findRandomGame();
  const gameId = `${game.id}`;
  const image = parseImage(game);
  const date = parseDate(game);
  const dbGame = await getGame(gameId);

  const msg = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(game.name)
    .setAuthor('Game of the Day')
    .setURL(game.site_detail_url)
    .addField('released', date, true)
    .addField('platforms', game.platforms?.map(p => p.name).join(', '), true)
    .setDescription(game.deck)
    .setImage(image);

  if (dbGame) {
    msg.addField(
      'Duplicate',
      `first sent on: ${formatDate(dbGame.first_sent_ts)}`
    );
  } else {
    saveGame(gameId, game.name, -1, 'datas');
  }

  return msg;
}
