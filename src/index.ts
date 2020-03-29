import * as api from './api';
import * as andrewBot from './andrewBot';

const PORT = process.env.PORT || 3000;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';

api.startServer(PORT);
andrewBot.startServer(DISCORD_BOT_TOKEN);
