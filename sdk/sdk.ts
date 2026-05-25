import { SokratechSDK, type SokratechConfig } from 'ppl-a4-sdk-react-native';

const env = (process.env ?? {}) as Record<string, string | undefined>;

const workflowId = env.EXPO_PUBLIC_SOKRATECH_WORKFLOW_ID;
const profileId = env.EXPO_PUBLIC_SOKRATECH_PROFILE_ID;

export const sdkConfig: SokratechConfig = {
  apiDomain: env.EXPO_PUBLIC_SOKRATECH_API_DOMAIN ?? 'http://localhost:3000',
  workflowId,
  profileId,
  ingestEndpoint: env.EXPO_PUBLIC_SOKRATECH_INGEST_ENDPOINT,
  recipes:
    workflowId && profileId
      ? undefined
      : {
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
        },
  profiling: { enabled: true },
};

export const sdkReady: Promise<SokratechSDK> =
  SokratechSDK.initAsync(sdkConfig);
