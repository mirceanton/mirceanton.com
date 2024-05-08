# =================================================================================================
# Building Stage
# =================================================================================================
FROM ruby:3.3.1-bookworm as builder

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
FROM nginx:1.25.5-alpine3.19-slim
COPY --from=builder /website /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf.d/site.conf