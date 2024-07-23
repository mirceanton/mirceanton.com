# =================================================================================================
# Building Stage
# =================================================================================================
FROM ruby:3.3.4-bookworm@sha256:66f846540dd76411ce9a9a51657d93bb51abb7c890bc5e88d1e6eb1c5acc7921 as builder

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
FROM nginx:1.27.0-alpine3.19-slim@sha256:128b00fcaa7b65716658bc2316a089ea9fc9b6ef8129b1db6d3643797e85dfca
COPY --from=builder /website /usr/share/nginx/html