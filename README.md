# AndrewBot - discord

A port of the AndrewBot project to work with Discord.

### Locally building docker image

tl;dr; on macOS, comment out `COPY qemu-arm-static /usr/bin` before building to build locally.

Because these are arm architecture we're building for, Docker Hub can't build without a compatability layer (the stuff in the hooks). Honestly, I don't quite understand why it works but this is what was needed in order to get this to work with Docker Hub and Watchtower.

Also don't touch the `hooks` folder...that's needed by Docker Hub to build this thing...

### License

MIT
