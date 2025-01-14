# =================================================================================================
# Building Stage
# =================================================================================================
FROM --platform=$BUILDPLATFORM ruby:3.4.1-bookworm@sha256:db9366b572a746570a51e999b5f12d332c4e15ef0e2aee0d40a29e7dc27b3526 AS builder

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
