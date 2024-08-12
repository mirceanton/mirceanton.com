#!/bin/bash

sudo apt update
sudo apt install -y webp

bundle install --gemfile=website/Gemfile
