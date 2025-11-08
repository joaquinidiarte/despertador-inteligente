FROM node:20-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar TODAS las dependencias (incluye devDependencies: typescript, ts-node, nodemon, etc.)
RUN npm ci

# El código se monta por volumen en docker-compose para hot-reload
# No copiamos el código aquí en modo desarrollo

EXPOSE 3000

ENV NODE_ENV=development

# El comando se define en docker-compose.yml: npm run dev
