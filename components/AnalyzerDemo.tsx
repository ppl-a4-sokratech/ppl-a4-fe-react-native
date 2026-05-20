import { ComingSoon } from './ui';

export function AnalyzerDemo() {
  return (
    <ComingSoon
      title="Behavioral Analyzer"
      description="Memproses payload behavioral (touch, scroll, input, sensor) dan menjalankan rule-based bot detection untuk menghasilkan skor risiko."
      bullets={[
        'Agregasi event dari semua tracker',
        'Rule-based scoring (kecepatan, ritme, pola)',
        'Flag indikasi bot / non-human',
        'Output skor risiko + alasan',
      ]}
    />
  );
}
