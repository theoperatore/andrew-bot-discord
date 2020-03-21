FROM arm32v7/node:12.16.1-alpine3.11

RUN mkdir -p /app
WORKDIR /app

COPY tsconfig.json .
COPY package.json .
COPY yarn.lock .
COPY src .

RUN yarn install
RUN yarn build

ENTRYPOINT ["yarn", "start"];
