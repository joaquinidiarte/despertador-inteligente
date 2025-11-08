#!/usr/bin/env python3

import cv2
import mediapipe as mp
import time
import json
import os
from datetime import datetime
import requests
from pathlib import Path

# Detectar si estamos en modo headless (Docker sin display)
HEADLESS = os.getenv('HEADLESS', 'false').lower() == 'true'

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
IMAGES_DIR = DATA_DIR / 'images'
STATE_FILE = DATA_DIR / 'state.json'

BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3000')

IMAGES_DIR.mkdir(parents=True, exist_ok=True)

if HEADLESS:
    print("🖥️  Modo HEADLESS activado (sin interfaz gráfica)")
    # Configurar OpenCV para no usar GUI
    os.environ['QT_QPA_PLATFORM'] = 'offscreen'

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)

print("✅ MediaPipe inicializado correctamente")

def leer_estado():
    """Lee el estado del archivo compartido con el backend"""
    try:
        if STATE_FILE.exists():
            with open(STATE_FILE, 'r') as f:
                estado = json.load(f)
                
                # DEBUG: Mostrar estado cada vez que se lee
                if estado.get('monitoring', False):
                    print(f"📊 Estado leído: monitoring={estado.get('monitoring')}, alarm_set={estado.get('alarm_set')}, alarm_time={estado.get('alarm_time')}")
                
                return estado
        else:
            print(f"⚠️  Archivo de estado no existe: {STATE_FILE}")
    except Exception as e:
        print(f"⚠️  Error leyendo estado: {e}")
    
    return {'monitoring': False}


def es_mano_abierta_arriba(hand_landmarks):
    """
    Detecta si la mano está abierta y extendida hacia arriba
    Verifica que todos los dedos estén extendidos
    """
    landmarks = hand_landmarks.landmark
    
    wrist = landmarks[0]
    
    thumb_tip = landmarks[4]
    index_tip = landmarks[8]
    middle_tip = landmarks[12]
    ring_tip = landmarks[16]
    pinky_tip = landmarks[20]
    
    index_mcp = landmarks[5]
    middle_mcp = landmarks[9]
    ring_mcp = landmarks[13]
    pinky_mcp = landmarks[17]
    
    dedos_arriba = (
        index_tip.y < index_mcp.y and
        middle_tip.y < middle_mcp.y and
        ring_tip.y < ring_mcp.y and
        pinky_tip.y < pinky_mcp.y
    )
    
    # Verificar que la mano no esté muy lejos
    tamano_mano = abs(middle_tip.y - wrist.y)
    tamano_suficiente = tamano_mano > 0.2
    
    return dedos_arriba and tamano_suficiente


def guardar_imagen(frame):
    """Guarda la imagen capturada"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'hand_{timestamp}.jpg'
    filepath = IMAGES_DIR / filename
    
    cv2.imwrite(str(filepath), frame)
    print(f"imagen guardada: {filename}")
    
    return filename


def notificar_backend(image_filename):
    """Notifica al backend que se detectó la mano"""
    try:
        response = requests.post(
            f'{BACKEND_URL}/api/hand-detected',
            json={'image_path': image_filename},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"backend notificado: {data.get('message')}")
            return True
        else:
            print(f"error del backend: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("no se pudo conectar con el backend. ¿Está corriendo?")
        return False
    except Exception as e:
        print(f"error notificando backend: {e}")
        return False


def verificar_backend():
    """Verifica que el backend esté disponible"""
    try:
        response = requests.get(f'{BACKEND_URL}/api/check-hand', timeout=3)
        return response.status_code == 200
    except:
        return False


def main():
    print("\n" + "="*50)
    print("detector de manos - despertador inteligente")
    print("="*50)
    
    print("\n🔍 Verificando conexión con backend...")
    if verificar_backend():
        print("backend conectado")
    else:
        print("backend no disponible. El sistema seguirá intentando...")
    
    print("\nIniciando webcam...")
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("error: No se pudo abrir la webcam")
        return
    
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    print("webcam iniciada correctamente")

    if not HEADLESS:
        print("\n" + "="*50)
        print("INSTRUCCIONES:")
        print("- Presiona 'q' para salir")
        print("- Presiona 's' para tomar screenshot")
        print("- Presiona 'd' para ver estado de debug")
        print("- Cuando la alarma esté activa, extiende tu mano")
        print("="*50 + "\n")
    else:
        print("\n" + "="*50)
        print("MODO HEADLESS ACTIVO")
        print("- Ejecutándose en segundo plano")
        print("- Sin interfaz gráfica")
        print("- Presiona Ctrl+C para detener")
        print("="*50 + "\n")
    
    ultima_deteccion = 0
    cooldown = 3
    frame_count = 0
    fps_time = time.time()
    fps = 0
    ultimo_estado_monitoring = False
    
    try:
        while True:
            ret, frame = cap.read()
            
            if not ret:
                print("error leyendo frame de la cámara")
                break
            
            frame_count += 1
            
            # Calcular FPS cada segundo
            if time.time() - fps_time >= 1.0:
                fps = frame_count
                frame_count = 0
                fps_time = time.time()
            
            # Voltear imagen
            frame = cv2.flip(frame, 1)
            
            # Convertir a RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Procesar con MediaPipe
            results = hands.process(rgb_frame)
            
            # Leer estado actual
            estado = leer_estado()
            monitoring = estado.get('monitoring', False)
            alarm_time = estado.get('alarm_time', 'N/A')
            
            # Detectar cambio de estado
            if monitoring != ultimo_estado_monitoring:
                if monitoring:
                    print(f"\n🔔 ¡ALARMA ACTIVADA! Hora: {alarm_time}")
                    print("👋 Esperando detección de mano...")
                else:
                    print("\n💤 Modo standby")
                ultimo_estado_monitoring = monitoring
            
            # UI en pantalla (solo si no es headless)
            if not HEADLESS:
                status_color = (0, 255, 0) if monitoring else (128, 128, 128)
                status_text = f"ESPERANDO MANO - {alarm_time}" if monitoring else "STANDBY"

                cv2.putText(frame, status_text, (10, 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)

                cv2.putText(frame, f"FPS: {fps}", (10, 60),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

                # Contador de detecciones
                manos_detectadas = len(results.multi_hand_landmarks) if results.multi_hand_landmarks else 0
                cv2.putText(frame, f"Manos: {manos_detectadas}", (10, 90),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
            
            # Si se detectan manos
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    # Dibujar landmarks (solo si no es headless)
                    if not HEADLESS:
                        mp_drawing.draw_landmarks(
                            frame,
                            hand_landmarks,
                            mp_hands.HAND_CONNECTIONS,
                            mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                            mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2)
                        )

                    # Verificar si es mano abierta
                    if es_mano_abierta_arriba(hand_landmarks):
                        if not HEADLESS:
                            cv2.putText(frame, "MANO ABIERTA DETECTADA", (10, 120),
                                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                        
                        # Si estamos monitoreando
                        if monitoring:
                            tiempo_actual = time.time()
                            
                            if tiempo_actual - ultima_deteccion > cooldown:
                                print("\n" + "="*50)
                                print("👋 ¡MANO ABIERTA DETECTADA!")
                                print(f"   Hora de alarma: {alarm_time}")
                                print("="*50)
                                
                                # Guardar imagen
                                image_filename = guardar_imagen(frame)
                                
                                # Notificar al backend
                                if notificar_backend(image_filename):
                                    ultima_deteccion = tiempo_actual

                                    # Confirmación visual (solo si no es headless)
                                    if not HEADLESS:
                                        overlay = frame.copy()
                                        cv2.rectangle(overlay, (0, 0),
                                                    (frame.shape[1], frame.shape[0]),
                                                    (0, 255, 0), -1)
                                        frame = cv2.addWeighted(frame, 0.7, overlay, 0.3, 0)

                                print("="*50 + "\n")

            # Mostrar frame (solo si no es headless)
            if not HEADLESS:
                cv2.imshow('Detector de Manos - Despertador', frame)

            # Capturar teclas (solo si no es headless)
            if not HEADLESS:
                key = cv2.waitKey(1) & 0xFF

                if key == ord('q'):
                    print("\ncerrando detector...")
                    break
                elif key == ord('s'):
                    screenshot_name = guardar_imagen(frame)
                    print(f"screenshot guardado: {screenshot_name}")
                elif key == ord('d'):
                    # Debug: mostrar estado actual
                    print("\n" + "="*50)
                    print("DEBUG - ESTADO ACTUAL")
                    print("="*50)
                    print(f"Monitoring: {monitoring}")
                    print(f"Alarm time: {alarm_time}")
                    print(f"State file: {STATE_FILE}")
                    print(f"File exists: {STATE_FILE.exists()}")
                    if STATE_FILE.exists():
                        with open(STATE_FILE, 'r') as f:
                            print(f"File content: {f.read()}")
                    print("="*50 + "\n")
            else:
                # En modo headless, pequeña pausa para no consumir 100% CPU
                time.sleep(0.01)
    
    except KeyboardInterrupt:
        print("\n\ninterrumpido por el usuario")
    
    finally:
        print("\n🧹 Liberando recursos...")
        cap.release()
        cv2.destroyAllWindows()
        hands.close()
        print("✅ Detector detenido correctamente")
        print("\n" + "="*50 + "\n")


if __name__ == '__main__':
    main()