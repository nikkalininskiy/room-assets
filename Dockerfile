# Dockerfile

# ============================================
# Stage 1: deps — установка зависимостей
# ============================================
FROM node:22 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
# Устанавливаем платформенные бинарники для Linux
RUN npm install @rolldown/binding-linux-x64-gnu --no-save --force
RUN npm install lightningcss-linux-x64-gnu --no-save --force

# ============================================
# Stage 2: dev — для разработки (Vite + HMR)
# ============================================
FROM node:22 AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# ============================================
# Stage 3: build — сборка статики
# ============================================
FROM node:22 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ============================================
# Stage 4: prod — Nginx + статика
# ============================================
FROM nginx:1.27-alpine AS prod
RUN rm -f /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]