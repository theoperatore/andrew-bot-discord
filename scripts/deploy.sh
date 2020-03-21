#!/usr/bin/env bash

USER=pi
IMAGE_NAME=theoperatore/andrew-bot:latest
CONTAINER_NAME=andrewbot
DEPLOY_HOST=andrewbot.local

function image_upgrade() {
	ssh $USER@$DEPLOY_HOST 'bash -s' < ./image-upgrade.sh $IMAGE_NAME $CONTAINER_NAME
}

# start pinging the new service
function health_check() {
	# cause doing this in bash is like...super hard
	scripts/health_check.js http://andrewbot.local:3000/ping
}

function main() {
	image_upgrade;
	health_check;
}

main;
