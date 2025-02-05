#!/bin/bash

sudo apt update
sudo apt install -y webp imagemagick

bundle install --gemfile=website/Gemfile
