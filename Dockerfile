# =================================================================================================
# Building Stage
# =================================================================================================
FROM ruby:3.3.5-bookworm@sha256:e87fc97f3a9eaa0f46d5f71710b97037f6b617e11d531b3fd1846ac13da5521d AS builder

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