#!/usr/bin/env bash

ssh pi@andrewbot.local sudo systemctl disable andrewbot.service
ssh pi@andrewbot.local sudo systemctl disable watchtower.service
