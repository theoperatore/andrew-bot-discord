#!/usr/bin/env bash

ssh pi@andrewbot.local mkdir -p /home/pi/andrewbot
rsync -avzhP .env pi@andrewbot.local:/home/pi/andrewbot/env
rsync -avzhP .env.watchtower pi@andrewbot.local:/home/pi/andrewbot/env.watchtower
