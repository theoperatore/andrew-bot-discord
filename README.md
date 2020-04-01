# AndrewBot - discord

A port of the AndrewBot project to work with Discord.

### Developer logs

I started writing [logs](./docs/logs.md) on how to get this running on my RaspberryPi3 B+ with docker / Docker Hub / Watchtower / Discord.js. Dunno if you'd be interested but they're kinda fun to read through.

### Locally building docker image

tl;dr; on macOS, comment out `COPY qemu-arm-static /usr/bin` before building to build locally.

Because these are arm architecture we're building for, Docker Hub can't build without a compatability layer (the stuff in the hooks). Honestly, I don't quite understand why it works but this is what was needed in order to get this to work with Docker Hub and Watchtower.

Also don't touch the `hooks` folder...that's needed by Docker Hub to build this thing...

### Secrets

Right now for simplicity, all secrets are copied over from a `.env` file manually. The variables defined in the local `.env` file will be mounted via the `docker run` option `--env-file` and available at runtime.

Currently used environment vars defined this way:

```
- DISCORD_BOT_TOKEN: `string` - the token from discord's bot page
- GB_TOKEN: `string` - the api token for access to GiantBomb's api
```

### Watchtower secrets

To configure watchtower easily, I've added another local env file: `.env.watchtower`. When you run the `copy-env.sh` script it'll copy over both env files to the raspberry pi.

Then, each systemctl service will attempt to read those env files at docker runtime via `--env-file`.

Check the [watchtower documentation](https://containrrr.github.io/watchtower/arguments/) on which variables are to be used when.

Currently, watchtower is set to update every 10 mins.

### License

MIT
