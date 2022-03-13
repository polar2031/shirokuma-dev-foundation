FROM node:14 as deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:14 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
ENV NODE_ENV production
COPY . .
RUN --mount=type=secret,id=env,dst=/app/.env npm run build
EXPOSE 1337
CMD npm start
