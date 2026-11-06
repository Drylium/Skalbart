FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js app.js db.js ./
COPY routes ./routes
COPY controllers ./controllers

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]