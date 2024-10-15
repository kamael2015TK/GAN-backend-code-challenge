FROM node:22-alpine
ENV NODE_ENV=production

# missing env file, could be set here, default values would be used
COPY core ./core
COPY modules ./modules
COPY addresses.json .
COPY package-lock.json .
COPY package.json .
COPY server.js .

RUN npm ci --only=production --ignore-scripts

EXPOSE 8080

CMD ["npm", "run", "start:server"]
