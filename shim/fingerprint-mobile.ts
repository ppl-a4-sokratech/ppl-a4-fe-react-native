import { Dimensions, PixelRatio, Platform } from 'react-native';
import * as Device from 'expo-device';
import type {
  HardwareData,
  NetworkData,
  ScreenData,
} from 'ppl-a4-sdk-react-native';

export function getMobileHardwareData(): HardwareData {
  const memoryBytes = Device.totalMemory;
  const memoryGb =
    memoryBytes && memoryBytes > 0
      ? Math.round((memoryBytes / 1024 / 1024 / 1024) * 10) / 10
      : 'unknown';

  const platformLabel = `${Platform.OS}/${String(Platform.Version)}`;

  return {
    core: 'unknown',
    memory: memoryGb,
    touchPoints: Platform.OS === 'ios' ? 5 : 10,
    platform: platformLabel,
    hasBattery: Device.deviceType === Device.DeviceType.PHONE,
  };
}

export function getMobileNetworkData(): NetworkData {
  const locale = resolveLocale();
  const timezone = resolveTimezone();

  const modelName = Device.modelName ?? 'unknown';
  const osName = Device.osName ?? Platform.OS;
  const osVersion = Device.osVersion ?? String(Platform.Version);
  const userAgent = `${osName}/${osVersion} (${modelName})`;

  return {
    userAgent,
    vendor: Device.manufacturer ?? Device.brand ?? 'unknown',
    language: locale,
    languages: [locale],
    cookieEnabled: false,
    doNotTrack: null,
    webdriver: false,
    timezone,
    pdfViewerEnabled: 'unknown',
    online: 'unknown',
  };
}

export function getMobileScreenData(): ScreenData {
  const screen = Dimensions.get('screen');
  const window = Dimensions.get('window');
  const pixelRatio = PixelRatio.get();
  const orientation = screen.width >= screen.height ? 'landscape' : 'portrait';

  return {
    width: Math.round(screen.width),
    height: Math.round(screen.height),
    availWidth: Math.round(window.width),
    availHeight: Math.round(window.height),
    colorDepth: 24,
    pixelDepth: 24,
    pixelRatio,
    orientation,
  };
}

function resolveLocale(): string {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().locale;
    if (typeof resolved === 'string' && resolved.length > 0) return resolved;
  } catch {}
  return 'unknown';
}

function resolveTimezone(): string {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (typeof resolved === 'string' && resolved.length > 0) return resolved;
  } catch {}
  return 'unknown';
}
