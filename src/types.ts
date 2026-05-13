export interface PrinterState {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  hostname: string;
  extruderTemperature: number;
  bedTemperature: number;
  isPrinting: boolean;
  fanSpeed: number;
  isHomed: boolean;
}

export interface LidarConfig {
  laserPin: string;
  cameraUrl: string;
  cameraDevice: string;
  xOffset: number;
  yOffset: number;
  calibrationLength: number;
  flowRange: [number, number];
  selectedFilament: string;
}

export interface CalibrationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}
