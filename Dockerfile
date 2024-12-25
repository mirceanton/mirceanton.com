# =================================================================================================
# Building Stage
# =================================================================================================
FROM --platform=$BUILDPLATFORM ruby:3.3.6-bookworm@sha256:2755a2089fe35e6ee4c9f370b5112ec835dc31f131e38042336059af4553173f AS builder

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
