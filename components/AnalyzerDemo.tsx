import { ComingSoon } from './ui';

export function AnalyzerDemo() {
  return (
    <ComingSoon
      title="Behavioral Analyzer"
      description="Rule-based risk scoring on the behavioral payload."
      bullets={[
        'Aggregate events across trackers',
        'Score on speed, rhythm, pattern',
        'Flag bot indicators',
        'Return risk score + reasons',
      ]}
    />
  );
}
