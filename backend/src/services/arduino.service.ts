class ArduinoService {
  private isConnected: boolean = false;

  constructor() {
    console.log('arduino service mock');
  }

  sendCommand(command: 'ON' | 'OFF'): void {
    console.log(`comando: ${command}`);
  }

  getStatus(): boolean {
    return this.isConnected;
  }
}

export default new ArduinoService();