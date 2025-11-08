FROM python:3.11-slim

# Instalar dependencias del sistema para OpenCV y MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgomp1 \
    v4l-utils \
    libopencv-dev \
    python3-opencv \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# El código se monta por volumen en docker-compose para desarrollo
# No copiamos el código aquí en modo desarrollo

# Variables de entorno
ENV PYTHONUNBUFFERED=1
ENV BACKEND_URL=http://backend:3000

# El comando se define en docker-compose.yml: python hand_detector.py