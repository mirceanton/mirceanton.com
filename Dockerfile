# =================================================================================================
# Building Stage
# =================================================================================================
FROM ruby:3.3.5-bookworm@sha256:c9e1ded81d9c0579fd52bd53ed06ced514e4dde3296ee9a9e0805212f1ab6502 AS builder

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