#!/bin/bash
set -ex

NODE_VERSION=6
IMAGE_ARCH=raspberrypi
PROJECT_PATH=$(dirname $0)/../../

cd $PROJECT_PATH

docker run -it --rm --name my-running-script -v "$PWD":/usr/src/myapp -w /usr/src/myapp resin/${IMAGE_ARCH}-node:$NODE_VERSION bash
