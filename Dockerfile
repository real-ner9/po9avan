FROM node:24

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn config set registry https://registry.npmjs.org
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

CMD ["node", "dist/main"]
