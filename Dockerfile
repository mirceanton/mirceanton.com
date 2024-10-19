# =================================================================================================
# Building Stage
# =================================================================================================
FROM --platform=$BUILDPLATFORM ruby:3.3.5-bookworm@sha256:a37960979f1df0639b5eace469f5edaa28ccb76965dd014ba8dc010dcda3bf4c AS builder

# Install Jekyll and Bundler
RUN gem install bundler jekyll && jekyll --version

# Copy website into the builder
WORKDIR /code
COPY ./website/ /code

# Install required gems
RUN bundle install

# Build website
RUN bundle exec jekyll build

# =================================================================================================
# Production Stage
# =================================================================================================
FROM nginx:1.27.0-alpine3.19-slim@sha256:a529900d9252ce5d04531a4a594f93736dbbe3ec155a692d10484be82aaa159a
COPY --from=builder /code/_site /usr/share/nginx/html
