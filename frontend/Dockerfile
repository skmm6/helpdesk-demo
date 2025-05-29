# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Передаём в Nuxt другой порт
ENV NUXT_HOST=127.0.0.1 
ENV NUXT_PORT=5173

EXPOSE 5173

# Запускаем Nuxt с учётом переменных
CMD ["npm", "run", "dev"]