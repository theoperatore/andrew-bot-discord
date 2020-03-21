# Logs

What I went through to get AndrewBot-Discord up and running.

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
