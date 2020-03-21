#!/usr/bin/env bash

# run all on remote server
# NOTE: this requires the server to "docker login"...
# 
# simple script to stop the current running container,
# pull the latest image
# remove the old container and start up a new container (daemon)
# from the newest image, while exposing the correct ports
# eventually this should be more configurable...but meh, good enough
IMAGE_NAME=$1
CONTAINER_NAME=$2

docker pull $IMAGE_NAME
docker rm -f $CONTAINER_NAME
docker run -d -p 3000:3000 --name=$CONTAINER_NAME $IMAGE_NAME
