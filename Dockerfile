# =================================================================================================
# Building Stage
# =================================================================================================
FROM --platform=$BUILDPLATFORM ruby:3.4.2-bookworm@sha256:0bfffe35ea1fda4181e0e833c16a9b181cedaa7f2ad24bc2ff23731d81b56139 AS builder

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
