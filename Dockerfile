# Build stage
FROM node:24-alpine AS build
WORKDIR /app
ENV NODE_ENV=production

# Включаем corepack и кэшируем зависимости
RUN corepack enable
COPY package.json yarn.lock ./
RUN --mount=type=cache,id=yarn-cache,sharing=locked,target=/root/.yarn \
    yarn install --frozen-lockfile

# Копируем исходники и билдим
COPY . .
RUN yarn build \
 && rm -rf node_modules \
 && yarn install --frozen-lockfile --production --prefer-offline \
 && yarn cache clean

# Runtime stage
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Копируем только нужное
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
COPY public ./public

# Без root
USER node

ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/main"]
