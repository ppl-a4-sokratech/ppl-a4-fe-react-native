import { SokratechSDK, type SokratechConfig } from 'ppl-a4-sdk-react-native';

export const sdkConfig: SokratechConfig = {
  apiKey: 'demo-api-key-12345',
  apiDomain: 'https://api.sokratech.example',
  recipes: {
    fingerprint: {
      enabled: true,
      audio: true,
      canvas: true,
      hardware: true,
      network: true,
      screen: true,
    },
    behavioral: {
      enabled: true,
      touch: true,
      keyboard: true,
      scroll: true,
    },
    detection: {
      enabled: true,
      emulator: true,
      rooted: true,
      vpn: true,
    },
  },
  profiling: {
    enabled: true,
  },
};

// Single shared SDK instance for the whole PoC. The same profiler is reused
// by every demo so the Profiling tab shows metrics from all operations.
export const sdk = SokratechSDK.init(sdkConfig);
