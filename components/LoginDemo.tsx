import { ComingSoon } from './ui';

export function LoginDemo() {
  return (
    <ComingSoon
      title="Login"
      description="Form login yang mengirim fingerprint + sinyal behavioral ke backend untuk verifikasi risiko saat autentikasi."
      bullets={[
        'Capture behavioral saat user mengetik kredensial',
        'Lampirkan fingerprint perangkat ke request login',
        'Kirim ke endpoint auth via API client SDK',
        'Tampilkan keputusan risk-based auth',
      ]}
    />
  );
}
