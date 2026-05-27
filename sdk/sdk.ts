import { Platform } from 'react-native';
import { SokratechSDK, type SokratechConfig } from '@ppl-sokratech-sdk/ppl-a4-sdk-react-native';

function resolveApiDomain(): string {
  if (process.env.EXPO_PUBLIC_SOKRATECH_API_DOMAIN) {
    return process.env.EXPO_PUBLIC_SOKRATECH_API_DOMAIN;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/api/proxy`;
  }
  return 'http://localhost:3000';
}

export const defaultApiDomain = resolveApiDomain();

const LOCAL_RECIPES = {
  behavioral: {
    enabled: true,
    touch: true,
    drag: true,
    scroll: true,
    lifecycle: true,
    input: true,
    sensor: true,
  },
  fingerprint: {
    enabled: true,
    audio: true,
    canvas: true,
    graphics: true,
    fonts: true,
    device: true,
    screen: true,
  },
  detection: { enabled: true, emulator: true, webDriver: true },
} as const;

export function buildConfig(input: {
  workflowId: string;
  profileId: string;
}): SokratechConfig {
  const workflowId = input.workflowId.trim();
  const profileId = input.profileId.trim();
  const hasRemote = workflowId.length > 0 && profileId.length > 0;
  return {
    apiDomain: defaultApiDomain,
    workflowId: hasRemote ? workflowId : undefined,
    profileId: hasRemote ? profileId : undefined,
    recipes: hasRemote ? undefined : LOCAL_RECIPES,
    profiling: { enabled: true },
  };
}

export function initSdk(config: SokratechConfig): Promise<SokratechSDK> {
  return SokratechSDK.initAsync(config);
}
