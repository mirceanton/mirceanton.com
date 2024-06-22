# =================================================================================================
# Building Stage
# =================================================================================================
FROM ruby:3.3.3-bookworm@sha256:8584c968202ea356984262c4422461ee3a6022c0c4d8fb517b7b9c6395556670 as builder

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
FROM nginx:1.27.0-alpine3.19-slim@sha256:66943ac4a1ca7f111097d3c656939dfe8ae2bc8314bb45d6d80419c5fb25e304
COPY --from=builder /website /usr/share/nginx/html