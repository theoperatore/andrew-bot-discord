#!/usr/bin/env bash

# Run this on the raspberry pi itself only
sudo cp /home/pi/services/* /etc/systemd/system
sudo systemctl enable watchtower.service
sudo systemctl enable andrewbot.service
sudo systemctl daemon-reload
sudo systemctl start watchtower.service
sudo systemctl start andrewbot.service
