import { ComingSoon } from './ui';

export function DetectionDemo() {
  return (
    <ComingSoon
      title="Bot / Automation Detection"
      description="Menjalankan heuristik untuk mendeteksi emulator, perangkat yang di-root, koneksi VPN, dan otomatisasi (webdriver)."
      bullets={[
        'Emulator detection (Android/iOS)',
        'Rooted / jailbroken device check',
        'VPN / proxy detection',
        'Webdriver / headless automation flags',
      ]}
    />
  );
}
