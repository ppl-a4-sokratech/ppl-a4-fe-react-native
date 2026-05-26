import { ComingSoon } from './ui';

export function RegisterDemo() {
  return (
    <ComingSoon
      title="Register"
      description="Sign-up form that baselines device + behavioral profile."
      bullets={[
        'Fingerprint at sign-up time',
        'Baseline behavioral profile',
        'Detect mass / automated signup',
        'Send via SDK ingest client',
      ]}
    />
  );
}
