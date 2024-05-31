# =================================================================================================
# Building Stage
# =================================================================================================
FROM ruby:3.3.2-bookworm@sha256:a67dcbc840ad773775c250f0caef2554a0c6f487289c6b113e1fa4aa1e175887 as builder

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
FROM nginx:1.27.0-alpine3.19-slim@sha256:3e9fb1e3981db06e79f214d685748b74df38f9b50ca439438a095c1316231707
COPY --from=builder /website /usr/share/nginx/html