FROM node:14
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ENV NODE_ENV=production
ARG URL
ENV URL=$URL
RUN npm run build
EXPOSE 1337
CMD npm start