FROM node:18-alpine as web-builder

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN echo network-timeout 600000 > .yarnrc && \
  yarn install --frozen-lockfile && \
  yarn cache clean

COPY src src
COPY tsconfig.json .

RUN yarn package

FROM amazoncorretto:17 as jar-builder

# renovate: datasource=github-tags depName=jaoafa/DynmapProcessor
ENV DYNMAP_PROCESSOR_TAG v1.1.0

WORKDIR /build

# hadolint ignore=DL3033
RUN yum install -y git && \
  yum clean all && \
  git clone https://github.com/jaoafa/DynmapProcessor . && \
  git checkout ${DYNMAP_PROCESSOR_TAG} && \
  chmod +x ./gradlew && \
  ./gradlew package

FROM node:18-alpine as runner

# hadolint ignore=DL3018
RUN apk update && \
  apk upgrade && \
  wget -q -O /etc/apk/keys/amazoncorretto.rsa.pub  https://apk.corretto.aws/amazoncorretto.rsa.pub && \
  echo "https://apk.corretto.aws/" >> /etc/apk/repositories && \
  apk update && \
  apk add --update --no-cache amazon-corretto-17 && \
  apk add --update --no-cache tzdata && \
  cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
  echo "Asia/Tokyo" > /etc/timezone && \
  apk del tzdata

WORKDIR /app

COPY --from=web-builder /app/output .
COPY --from=jar-builder /build/build/libs/*.jar /app/app.jar

ENV NODE_ENV production
ENV API_PORT 80
ENV DYNMAP_PROCESSOR_JAR_PATH /app/app.jar

VOLUME [ "/data" ]

ENTRYPOINT [ "node", "index.js" ]