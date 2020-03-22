# Logs

What I went through to get AndrewBot-Discord up and running. I started this log after doing some initial research. The requirements are:

- A server that is always running (no sleep) (needed for discord's websocket)
- Has automated deployments after merging to master
- A platform environment that can easily be swapped out for another (rpi => digital ocean => PaaS)
- Costs me 0\$ for upkeep

I investigated using [Zeit.co](https://zeit.co) with [next.js](https://nextjs.org) but couldn't use that because zeit doesn't support non-serverless environments (violated the "always running" requirement).

[Digital Ocean's Kubernetes](https://www.digitalocean.com/products/kubernetes/) deployments would make everything super easy, except that it costs ~\$50/month.

[A Digital Ocean droplet(s) running dokku](https://marketplace.digitalocean.com/apps/dokku) would also make everything super easy, except that it costs ~/\$10/month (want to run it on the 2nd lowest tier).

Also considered [heroku](https://www.heroku.com/pricing) but again they wanted to sleep my machines unless I paid \$5/month, might as well go with Digital Ocean (cause I kinda like them better) at that point.

I consulted my brother through the whole process and as we were talking I was wondering what would need to happen to make the original AndrewBot raspberrypi3 B+ work. That's where we start the investigation...

### Friday March 20, 2020

After suggestion from my brother, I investigated [piku](https://github.com/piku/piku); something that I hope will help me easily deploy applications to my local raspberrypi3 model B+.

However before I started, I wanted to shutdown the previously running items including amplify-agent, nginx, and my cron jobs (check-dns, gotd, certbot).

Over the night I `sudo apt update` and `sudo apt full-upgrade -y` to get as up-to-date as possible.

Tomorrow I'll begin installing piku onto AndrewBot, my raspberry pi. I worry that since Piku is heavily based on python methodologies, that the node.js support will be limited...

### Saturday March 21, 2020

Upgrade successful, I also removed custom sources from my apt lists, including old, non-gpg verified yarn installations. I believe they have a new way to install yarn onto debian systems so I'll check that out soon.

Today however, I hope to install piku and see what kind of automatic node.js support I can get. Looking at the piku built-in ansible playbook `nodeenv.yml`'s [documentation](https://github.com/ekalinin/nodeenv), it seems it's very old. The last time this was updated, the latest node version was `0.4.6`, I hope to get the latest LTS of 12 there.

### Saturday March 21, 2020 -- supplemental

I bootstrapped AndrewBot with piku using the installation instructions:

```bash
curl https://piku.github.io/get | sh

# important! bootstrap needs ssh access without password
ssh-copy-id pi@andrewbot.local

# actually bootstrap the thing
./piku-bootstrap pi@andrewbot.local
```

I had to copy over an ssh key to the root user in order to bootstrap. Previously I was just using password logins. Now I'll have to be sure to always get my ssh key from this laptop...

Anyway, piku installed successfully. Going to see what I need for a node environment.

### Saturday March 21, 2020 -- supplemental

Screw it, piku isn't going to work for me, rolling my own ansible configuration is too much work, and I still don't want to pay money. I'm going with what I know and what is free for now.

I'm cleaning my single private Docker Hub repository I used long ago for my D&D 5E character app to use for this instead. Docker Hub also has a github integration for building and pushing to the hub on merge to master. Bonus!

All I gotta do now is see if github workflows can help me with the restarting process. If that doesn't work I'll see how much work a Docker Hub webhook is to set up (prolly just dns that is hard). Otherwise good ol' polling to see if there is a new version available on an interval on the pi.

### Saturday March 21, 2020 -- supplemental

Bash is sometimes super hard to do stuff, like a health check with a timeout. It's times like these I'm super happy that I can just jump into node.js land and execute a script...

### Saturday March 21, 2020 -- supplemental

Finally got Docker Hub working with my sample server app. Took a lot of googling for why I couldn't `mkdir` on Docker Hub's build step.

Turns out I can't build for a different cpu archicture. The [recommendation](https://github.com/docker/hub-feedback/issues/1261#issuecomment-441126749) was to build the images on the pi itself, but that kinda defeats the purpose. I dunno. might go that route anyway...

For now, I am [installing Docker on my pi](https://www.docker.com/blog/happy-pi-day-docker-raspberry-pi/) and seeing if I can even run the damn thing. Here goes!

### Saturday March 21, 2020 -- supplemental

Success! The images that are built from master via Docker Hub are runnable perfecty by the raspberry pi. now for watchtower.

### Sunday March 22, 2020

I start today evaluating [Watchtower](https://containrrr.github.io/watchtower/). I realized that I have a private docker hub repo for AndrewBot. This means I have to give watchtower (and the pi) my docker hub credentials. I'll need credential support anyway in order to set my discord bot token during runtime so might as well think about this too.

I'm thinking that I'll copy over a `secrets.json` file in a predictable directory, probably `/alorg/secrets.json`. Then I'll have my container mount that file, if it exists into the running container of the app, and I'll be able to require it in node.js. To handle watchtower / docker hub credentials, it seems the raspberry pi already has `jq` installed so I can use that to parse the secrets file and extract a username, then extract the password into a temporary file in order to send via standard in to `docker login --username <name> --password-stdin`. Dunno if this is worth it, could just make the Docker Hub repository public and not have to deal with this nonsense. I mean the code repo is already public...I'll decide later.

For now, onto watchtower.
