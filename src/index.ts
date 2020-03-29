import * as api from './api';
import * as discord from './discord';

const PORT = process.env.PORT || 3000;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';

api.startServer(PORT);
discord.startServer(DISCORD_BOT_TOKEN);
