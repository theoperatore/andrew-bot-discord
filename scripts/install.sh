#!/usr/bin/env bash

cd scripts/installation

ssh pi@andrewbot.local mkdir -p /home/pi/services
ssh pi@andrewbot.local mkdir -p /home/pi/andrewbot
rsync -avzhP ../../.env pi@andrewbot.local:/home/pi/andrewbot/env
rsync -avzhrP services/* pi@andrewbot.local:/home/pi/services
rsync -avzhP remote-install.sh pi@andrewbot.local:/home/pi
ssh pi@andrewbot.local /home/pi/remote-install.sh

cd ../../
