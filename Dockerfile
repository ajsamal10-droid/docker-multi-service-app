# ---- Stage 1: build the React frontend ----
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Node.js API that also serves the built frontend ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY api/package*.json ./
RUN npm install --omit=dev
COPY api/ ./
COPY --from=frontend-build /frontend/dist ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
