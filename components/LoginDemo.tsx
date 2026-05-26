import { ComingSoon } from './ui';

export function LoginDemo() {
  return (
    <ComingSoon
      title="Login"
      description="Login form that ships fingerprint + behavioral signals on submit."
      bullets={[
        'Capture typing behavior on credentials',
        'Attach device fingerprint to request',
        'Send via SDK ingest client',
        'Show risk-based auth decision',
      ]}
    />
  );
}
