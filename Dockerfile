# =================================================================================================
# Building Stage
# =================================================================================================
FROM ruby:3.3.4-bookworm@sha256:4bea2a01b1c290fb4d571343285bd6e19d6dea8ca03887ecfcd417f4d362dd42 as builder

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
FROM nginx:1.27.0-alpine3.19-slim@sha256:aa12034f49f164af20b6b8bf5852da25fd4c65f32113198f40bf911ca48f2186
COPY --from=builder /website /usr/share/nginx/html