import { SokratechSDK, type SokratechConfig } from '@ppl-sokratech-sdk/ppl-a4-sdk-react-native';

export const defaultApiDomain =
  process.env.EXPO_PUBLIC_SOKRATECH_API_DOMAIN ?? 'http://localhost:3000';

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
