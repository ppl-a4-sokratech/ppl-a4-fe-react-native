import { ComingSoon } from './ui';

export function RegisterDemo() {
  return (
    <ComingSoon
      title="Register"
      description="Form registrasi yang menanamkan device fingerprint dan profil behavioral awal untuk mencegah pembuatan akun massal oleh bot."
      bullets={[
        'Fingerprint perangkat saat sign-up',
        'Profil behavioral baseline pengguna baru',
        'Deteksi pendaftaran otomatis / duplikat',
        'Kirim ke endpoint register via API client SDK',
      ]}
    />
  );
}
