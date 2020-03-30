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

# We run yarn install with an increased network timeout (5min) to avoid "ESOCKETTIMEDOUT" errors from hub.docker.com
# See, for example https://github.com/yarnpkg/yarn/issues/5540
# this was added due to adding next.js as a dep
RUN yarn install --frozen-lockfile --network-timeout 300000
RUN yarn build

ENV GIT_SHA ${COMMIT}
ENV GIT_BRANCH ${BRANCH}
ENV NODE_ENV production
EXPOSE 3000

ENTRYPOINT ["node", "dist/index.js"];
