FROM node:18-alpine

WORKDIR /usr/src/app

# install deps
COPY backend/package*.json ./
RUN npm ci --only=production

# copy app
COPY backend/ ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
