FROM arm32v7/node:12.16.1-alpine3.11

COPY qemu-arm-static /usr/bin

RUN mkdir /alorg
WORKDIR /alorg

COPY tsconfig.json .
COPY package.json .
COPY yarn.lock .
COPY src .

RUN yarn install
RUN yarn build

EXPOSE 3000

ENTRYPOINT ["yarn", "start"];
