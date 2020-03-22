FROM arm32v7/node:12.16.1-alpine3.11

ARG BRANCH="master"
ARG COMMIT=""
LABEL git_branch=${BRANCH}
LABEL git_commit=${COMMIT}

COPY qemu-arm-static /usr/bin

RUN mkdir /alorg
WORKDIR /alorg

COPY tsconfig.json .
COPY package.json .
COPY yarn.lock .
COPY src .

RUN yarn install
RUN yarn build

ENV GIT_SHA ${COMMIT}
ENV GIT_BRANCH ${BRANCH}
ENV NODE_ENV production
EXPOSE 3000

ENTRYPOINT ["node", "dist/index.js"];
