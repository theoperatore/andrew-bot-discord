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

### Sunday March 22, 2020 -- supplemental

Haven't gotten to watchtower yet. I got sidetracked setting up some more logging on startup and a better Dockerfile. Now it'll handle signals without having to pass them down via a bash script. Also outfitted my simple server with some examples of how to gracefully shutdown the server by capturing signals and unhandled events.

Although, it does mean that to test my app in production vs development is much harder. Might revisit later.

Anyway, now I have the git_hash and branch in my process so that I can know which version of the app I'm running. Thanks to [this post](https://artsy.github.io/blog/2018/09/10/Dockerhub-Stamping-Commits/). Think I'll add an "/info" route that returns the git sha, process id, maybe some other OS level things too? dunno. maybe I'll just have a separate process handle that monitoring stuff.

Hope this docker hub stuff works!

### Sunday March 22, 2020 -- supplemental

Watchtower is pretty nifty. There was some wonkiness with config/credentials. Need to start the andrewbot app with the image name: `index.docker.io/theoperatore/andrew-bot-discord`, then the config.json will match.

```bash
docker run --rm --name watchtower -e WATCHTOWER_DEBUG=true -e WATCHTOWER_POLL_INTERVAL=600 -v /home/pi/.docker/config.json:/config.json -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower:armhf-latest
```

Next step is to create some systemctl services so both andrewbot and watchtower will get restarted if the pi restarts.

### Sunday March 22, 2020 -- supplemental

Well I got everything working, then I rebooted the pi, but it wouldn't stay up. It seem to be kep crashing.

So I decided to start fresh. I flashed the newest verison of rasbian onto the sd card and started again. At least my documentation is up-to-date on how to bring up a headless pi...

### Sunday March 22, 2020 -- supplemental

Ok now I'm on latest raspian buster, installed everything, added watchtower and andrewbot as services in systemctl.

When I rebooted, it took an extra min to be stable, I assume because docker was doing lots of I/O which causes the system to hang waiting for the sd card?

Either way, we're in a stable place. Now going to make a change to the docker file to see if it'll crash if it tries to update the image.

After this, if everything works, I'll call this a good weekend!

### Monday March 23, 2020

Everything is set up, I even got environment variables in there. It's a bit wonky, but it seems to all be working right. I should put together a system diagram of the moving parts just so I know what's going on.

Now that I got the environment all set up, and everything is mostly automatic...I can actually start deving the server!

Progress!

### Tuesday March 24, 2020

Now I have watchtower reading from an env file as well, it should send me emails when it updates, hopefully.

Now that a majority of the infrastructure is in place, I can finally start working on the discord server itself! yay!

### Tuesday March 24, 2020 -- supplemental

I've found that watchtower stop scheduling updates if the notification stack fails. It uses smtp to send mail and by default, the raspberry pi doesn't have smtp as a service running.

Gonna install it via apt and see what happens:

```bash
sudo apt update
sudp apt install ssmtp
```

Here goes.

### Tuesday March 24, 2020 -- supplemental

`ssmtp` is deprecated on `raspian buster`. following the [instructions](https://www.raspberrypi.org/forums/viewtopic.php?t=244147#p1517480) I'm going to try swapping for `msmtp`.

Good ol' outdated packages!

### Tuesday March 24, 2020 -- supplemental

same problem from watchtower. Might skip the email and do notifications at a later date.

```bash
dial tcp: lookup smtp.google.com on 192.168.1.1:53
```

### Tuesday March 24, 2020 -- supplemental

I took 5 mins to see if the slack integration would work and what do you know! It works.

I created a new workspace named `Alorg Notifications` and added a new integration to it named AndrewBot Notifier via slack's api page. Then created a new Incoming Webhook for the andrewbot channel. Copied the webhook url and added it as an environment variable to watchtower and there we go.

Now I got notifications.

### Sunday March 29, 2020

Ok I have separated out my discord app from the api http server. I think I'm all set to start doing actual commands now.

The last thing that I want to automate is the `version`. Every time I commit to master, I want it to bump the patch version. I wonder if I need to do something with a github workflow? maybe an environment variable during the build step? I dunno. I'll look into it later. For now, I'll just manually bump the versions as I see fit.

### Monday March 30, 2020

I wanted to add some tests when I copied over the parser from the old AndrewBot. Getting jest to work with babel with typescript is a real pain, so instead, I added nextjs as a dependency (because I probably want to use that as a small dashboard for andrewbot locally anyway) and then I really don't need to do anything else! Nextjs handles all the transpilation for me.

HOWEVER. It seems adding nextjs as a dependency made the Docker Hub builds fail. The error I was seeing was due to network timeout. A quick google saw that yarn will frequently fail to download files when dependencies are large and the connection is slow. The work around is to just increase the timeout :(

Hopething this will work.

### Tuesday March 31, 2020

Now that everything seems to be stable and the command parsing works, going to try to get the game of the day functionality working.

### Wednesday April 1, 2020

Copied over most of the game of the day files. Now it's a matter of finding the best discord message formatting.

It's tough not having a preview option.

### Wednesday April 1, 2020 -- supplemental

I think I've got it good for now. About to push it to master. Saw a curious thing though, I noticed that andrewbot the raspberry pi was a little sluggish when sshing. Ran a few commands, `htop` and `docker stats` and noticed that each container was allocating ~1Gb of memory. They definitely don't need that much.

I restarted them using the `--memory` command and limited AndrewBot to use `200MiB` and watchtower to use `100Mib`. Going to monitor if this number is adequate during bust moments, like downloading new images for andrewbot or when there is increased stress and load during the "peak" usage hours of the discord channel.
