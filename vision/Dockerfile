# Usar Python 3.11 slim (más liviano para Raspberry Pi)
FROM python:3.11-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgstreamer1.0-0 \
    libavcodec-extra \
    libavformat58 \
    libswscale5 \
    v4l-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar requirements
COPY vision/requirements.txt .

# Instalar dependencias de Python
# Para Raspberry Pi, usamos versiones optimizadas
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY vision/ .

# Crear directorio para imágenes
RUN mkdir -p /data/images

# Variables de entorno
ENV PYTHONUNBUFFERED=1
ENV BACKEND_URL=http://backend:3000
ENV STATE_PATH=/data/state.json
ENV IMAGES_PATH=/data/images
ENV CAMERA_INDEX=0

# Health check (verifica que el proceso esté corriendo)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD pgrep -f "python.*main.py" > /dev/null || exit 1

# Comando para iniciar
CMD ["python", "-u", "main.py"]
