# AndrewBot - discord

A port of the AndrewBot project to work with Discord.

### Developer logs

I started writing [logs](./docs/logs.md) on how to get this running on my RaspberryPi3 B+ with docker / Docker Hub / Watchtower / Discord.js. Dunno if you'd be interested but they're kinda fun to read through.

### Deployment

This project will deploy any update to master to Heroku. Peep the Procfile for more.

### Secrets

Use a `.env` file. Currently used environment vars defined this way:

```
- DISCORD_BOT_TOKEN: `string` - the token from discord's bot page
- GB_TOKEN: `string` - the api token for access to GiantBomb's api
- GCLOUD_CREDENTIALS: `base64 string of json` - service account creds for firebase
- FIREBASE_URL: `url` - where the database is.
```

### License

MIT
