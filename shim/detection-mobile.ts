import * as Device from 'expo-device';

export interface MobileDetectionResult {
  emulator: boolean | 'unknown';
  rooted: boolean | 'unknown';
  vpn: boolean | 'unknown';
  debugBuild: boolean;
  signals: DetectionSignal[];
}

export interface DetectionSignal {
  key: string;
  value: string;
  note?: string;
}

export async function runMobileDetection(): Promise<MobileDetectionResult> {
  const signals: DetectionSignal[] = [];

  const isPhysicalDevice = Device.isDevice;
  signals.push({
    key: 'Device.isDevice',
    value: String(isPhysicalDevice),
    note: 'false = simulator / emulator',
  });

  if (Device.modelName) {
    signals.push({ key: 'Device.modelName', value: Device.modelName });
  }
  if (Device.osName) {
    signals.push({
      key: 'Device.osName',
      value: `${Device.osName} ${Device.osVersion ?? ''}`.trim(),
    });
  }
  if (Device.manufacturer) {
    signals.push({ key: 'Device.manufacturer', value: Device.manufacturer });
  }

  const debugBuild = __DEV__;
  signals.push({
    key: 'JS bundle',
    value: debugBuild ? 'dev (Metro)' : 'production',
    note: debugBuild ? 'Metro dev server attached' : undefined,
  });

  return {
    emulator: isPhysicalDevice ? false : true,
    rooted: 'unknown',
    vpn: 'unknown',
    debugBuild,
    signals,
  };
}
