import RPi.GPIO as GPIO
import time
import requests
import json
from datetime import datetime
import threading
import sys
import signal

LED_PIN = 17      #11
BUTTON_PIN = 22   #15

BACKEND_URL = "http://backend:3000"

DEBOUNCE_TIME = 0.3
CHECK_INTERVAL = 1.0       
RETRY_DELAY = 5.0       

class EstadoSistema:
    """Mantiene el estado del sistema"""
    
    def __init__(self):
        self.led_encendido = False
        self.alarma_activa = False
        self.led_manual = False
        self.ultima_pulsacion = 0
        self.backend_disponible = False
        self.ultima_verificacion_backend = 0
        self.running = True
    
    def reset_manual(self):
        """Resetear control manual del LED"""
        self.led_manual = False

estado = EstadoSistema()


def encender_led():
    """Encender LED"""
    if not estado.led_encendido:
        GPIO.output(LED_PIN, GPIO.HIGH)
        estado.led_encendido = True
        print(f"[{timestamp()}] LED encendido")


def apagar_led():
    if estado.led_encendido:
        GPIO.output(LED_PIN, GPIO.LOW)
        estado.led_encendido = False
        print(f"[{timestamp()}] LED apagado")


def toggle_led_manual():
    if estado.led_manual:
        estado.led_manual = False
        apagar_led()
        print(f"[{timestamp()}] LED apagado manualmente")
    else:
        estado.led_manual = True
        encender_led()
        print(f"[{timestamp()}] LED encendido manualmente")


def timestamp():
    return datetime.now().strftime("%H:%M:%S")


def leer_estado_backend():
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/estado", 
            timeout=2
        )
        
        if response.status_code == 200:
            data = response.json()
            estado.backend_disponible = True
            return data.get('monitoring', False)
        
    except requests.exceptions.ConnectionError:
        if estado.backend_disponible:
            print(f"[{timestamp()}] Backend no disponible")
            estado.backend_disponible = False
    except Exception as e:
        if estado.backend_disponible:
            print(f"[{timestamp()}] Error conectando backend: {e}")
            estado.backend_disponible = False
    
    return False


def notificar_backend_apagar_alarma():
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/alarma/apagar",
            json={"metodo": "boton_fisico"},
            timeout=2
        )
        
        if response.status_code == 200:
            print(f"[{timestamp()}] Backend notificado: Alarma apagada")
            return True
        else:
            print(f"[{timestamp()}] Backend respondió con código {response.status_code}")
            
    except Exception as e:
        print(f"[{timestamp()}] Error notificando backend: {e}")
    
    return False


def callback_boton(channel):
    tiempo_actual = time.time()
    
    if tiempo_actual - estado.ultima_pulsacion < DEBOUNCE_TIME:
        return
    
    estado.ultima_pulsacion = tiempo_actual
    
    # Confirmar que el botón está presionado
    time.sleep(0.05)  # Esperar 50ms
    if GPIO.input(BUTTON_PIN) != GPIO.HIGH:
        return
    
    print(f"\n[{timestamp()}] Botón presionado")
    
    # Caso 1: Hay alarma activa → Apagarla
    if estado.alarma_activa:
        print(f"[{timestamp()}] Apagando alarma...")
        apagar_led()
        notificar_backend_apagar_alarma()
        estado.reset_manual()
    
    # Caso 2: Sin alarma → Toggle LED manual
    else:
        print(f"[{timestamp()}]    → Toggle LED manual")
        toggle_led_manual()



def monitorear_alarma():
    print(f"[{timestamp()}] Iniciando monitoreo de alarma...")
    
    alarma_activa_anterior = False
    
    while estado.running:
        tiempo_actual = time.time()
        
        if tiempo_actual - estado.ultima_verificacion_backend >= CHECK_INTERVAL:
            estado.ultima_verificacion_backend = tiempo_actual

            alarma_activa_ahora = leer_estado_backend()
            
            if alarma_activa_ahora != alarma_activa_anterior:
                estado.alarma_activa = alarma_activa_ahora
                
                if alarma_activa_ahora:
                    # Alarma activada → Encender LED (forzado)
                    print(f"\n[{timestamp()}] ALARMA ACTIVADA")
                    print(f"[{timestamp()}] LED encendido automáticamente")
                    encender_led()
                    estado.reset_manual()
                
                else:
                    # Alarma desactivada → Apagar LED (forzado)
                    print(f"\n[{timestamp()}] Alarma desactivada")
                    print(f"[{timestamp()}] LED apagado automáticamente")
                    apagar_led()
                    estado.reset_manual()
                
                alarma_activa_anterior = alarma_activa_ahora
            
            # Si hay alarma activa, forzar LED encendido
            # (por si algo lo apagó externamente)
            if estado.alarma_activa and not estado.led_encendido:
                encender_led()
        
        time.sleep(0.1)

def inicializar_gpio():
    print(f"[{timestamp()}] Inicializando GPIO...")
    
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    
    GPIO.setup(LED_PIN, GPIO.OUT)
    GPIO.output(LED_PIN, GPIO.LOW)
    
    GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
    
    print(f"[{timestamp()}] GPIO inicializado")
    print(f"[{timestamp()}] LED: GPIO {LED_PIN}")
    print(f"[{timestamp()}] Botón: GPIO {BUTTON_PIN}")


def limpiar_gpio():
    print(f"\n[{timestamp()}] Limpiando GPIO...")
    apagar_led()
    GPIO.cleanup()
    print(f"[{timestamp()}] GPIO limpiado correctamente")


def signal_handler(sig, frame):
    print(f"\n[{timestamp()}] Señal de interrupción recibida")
    estado.running = False
    limpiar_gpio()
    sys.exit(0)

def main():    

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    inicializar_gpio()
    
    try:
        GPIO.add_event_detect(
            BUTTON_PIN, 
            GPIO.RISING, 
            callback=callback_boton, 
            bouncetime=300
        )
        print(f"[{timestamp()}] Interrupción de botón configurada")
    except Exception as e:
        print(f"[{timestamp()}] Error configurando interrupción: {e}")
        print(f"[{timestamp()}] El sistema seguirá funcionando")
    
    # Información del sistema
    print(f"\n[{timestamp()}] Configuración:")
    print(f"[{timestamp()}]    Backend: {BACKEND_URL}")
    print(f"[{timestamp()}]    Intervalo verificación: {CHECK_INTERVAL}s")
    print(f"[{timestamp()}]    Debounce botón: {DEBOUNCE_TIME}s")
    
    print(f"\n[{timestamp()}] Funcionamiento:")
    print(f"[{timestamp()}]    1. Sin alarma:")
    print(f"[{timestamp()}]       - Presionar botón → Enciende/Apaga LED")
    print(f"[{timestamp()}]    2. Con alarma activa:")
    print(f"[{timestamp()}]       - LED se enciende automáticamente")
    print(f"[{timestamp()}]       - Presionar botón → Apaga alarma y LED")
    print(f"[{timestamp()}]    3. Alarma desactivada:")
    print(f"[{timestamp()}]       - LED se apaga automáticamente")
    
    print(f"\n[{timestamp()}] Sistema listo")
    print(f"[{timestamp()}]    Presiona Ctrl+C para salir")
    print("="*60 + "\n")
    
    thread_monitoreo = threading.Thread(target=monitorear_alarma, daemon=True)
    thread_monitoreo.start()
    
    try:
        while estado.running:
            time.sleep(1)
    
    except KeyboardInterrupt:
        print(f"\n[{timestamp()}] Interrumpido por usuario")
    
    finally:
        estado.running = False
        limpiar_gpio()

if __name__ == '__main__':
    main()