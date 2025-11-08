FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo dev)
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=development
ENV PORT=3000

# Comando de desarrollo con hot-reload
CMD ["npm", "run", "dev"]