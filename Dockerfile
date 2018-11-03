FROM keymetrics/pm2:8-alpine
WORKDIR /usr/src/intercamb
COPY ./package*.json ./
RUN \
  apk add --no-cache --virtual .build-deps make gcc g++ python && \
  apk add --no-cache vips-dev fftw-dev build-base \
    --repository http://dl-cdn.alpinelinux.org/alpine/edge/main \
    --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing && \
  npm install --production && \
  apk del .build-deps && \
  touch config.yml
COPY . .
EXPOSE 3000
