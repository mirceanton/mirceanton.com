# =================================================================================================
# Building Stage
# =================================================================================================
FROM ruby:3.3.5-bookworm@sha256:2a57e5c868eac461dce2d1302dc57e00c94f335712856867c5038b589654de72 AS builder

# Install Jekyll and Bundler
RUN gem install bundler jekyll && \
    jekyll --version

# Copy website into the builder
WORKDIR /code
COPY ../website/ /code

# Install required gems
RUN bundle install

# Build website
RUN mkdir /website && \
    bundle exec jekyll build --destination=/website


# =================================================================================================
# Production Stage
# =================================================================================================
FROM nginx:1.27.0-alpine3.19-slim@sha256:a529900d9252ce5d04531a4a594f93736dbbe3ec155a692d10484be82aaa159a
COPY --from=builder /website /usr/share/nginx/html