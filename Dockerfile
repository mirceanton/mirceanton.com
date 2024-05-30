# =================================================================================================
# Building Stage
# =================================================================================================
FROM ruby:3.3.1-bookworm@sha256:797d68561a91415e05fd95178f467d86d77bce2d4f17f32683241a687cbd1705 as builder

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
FROM nginx:1.27.0-alpine3.19-slim@sha256:f8e869187a27097f4df6be09a87fb9b38f180529e52514d27d0c624bf6ba3c7b
COPY --from=builder /website /usr/share/nginx/html