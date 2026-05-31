FROM node:22-slim

LABEL org.opencontainers.image.name="siyuan-llmwiki-mcp"

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
RUN test -s /app/src/server.js
RUN test -s /app/src/wiki-ops.js
RUN test -s /app/src/siyuan-api-client.js

EXPOSE 31710

CMD ["npm", "start"]
