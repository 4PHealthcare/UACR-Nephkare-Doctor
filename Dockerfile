# ---- Build stage ----
FROM node:16 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build --configuration=production

# ---- Nginx stage ----
FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/nephkare-web-development /usr/share/nginx/html

EXPOSE 80
