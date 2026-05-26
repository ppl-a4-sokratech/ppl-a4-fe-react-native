import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  runMobileDetection,
  type MobileDetectionResult,
} from '../shim/detection-mobile';
import { sdk } from '../sdk/sdk';
import {
  Badge,
  Button,
  Card,
  colors,
  Paragraph,
  SectionTitle,
} from './ui';

const isWeb = Platform.OS === 'web';

export function DetectionDemo() {
  const [result, setResult] = useState<MobileDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      sdk.profiler.start('detection.run');
      const next = isWeb ? buildWebResult() : await runMobileDetection();
      sdk.profiler.end('detection.run', { platform: Platform.OS });
      setResult(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <View style={styles.titleRow}>
        <SectionTitle>Bot / Automation Detection</SectionTitle>
        <Badge label={isWeb ? 'Web stub' : 'Mobile shim'} tone="neutral" />
      </View>
      <Paragraph>
        {isWeb
          ? 'SDK detection module masih kosong. Web menampilkan navigator.webdriver dari runtime.'
          : 'Heuristik mobile: cek apakah perangkat fisik (Device.isDevice), model, OS, dan apakah JS bundle dev (Metro attached).'}
      </Paragraph>

      <Button
        label={loading ? 'Running…' : 'Run Detection'}
        onPress={run}
        disabled={loading}
      />

      {result && (
        <View style={{ marginTop: 12 }}>
          <View style={styles.verdictRow}>
            <Verdict label="Emulator" value={result.emulator} />
            <Verdict label="Rooted" value={result.rooted} />
            <Verdict label="VPN" value={result.vpn} />
            <Verdict label="Dev build" value={result.debugBuild} />
          </View>

          <Text style={styles.subheading}>Signals</Text>
          {result.signals.map((s) => (
            <View key={s.key} style={styles.signalRow}>
              <Text style={styles.signalKey}>{s.key}</Text>
              <Text style={styles.signalValue}>{s.value}</Text>
              {s.note && <Text style={styles.signalNote}>{s.note}</Text>}
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

function buildWebResult(): MobileDetectionResult {
  const nav = (globalThis as { navigator?: { webdriver?: boolean; userAgent?: string } })
    .navigator;
  const webdriver = Boolean(nav?.webdriver);
  return {
    emulator: 'unknown',
    rooted: 'unknown',
    vpn: 'unknown',
    debugBuild: typeof __DEV__ !== 'undefined' && __DEV__,
    signals: [
      {
        key: 'navigator.webdriver',
        value: String(webdriver),
        note: webdriver ? 'flag aktif — kemungkinan automation' : undefined,
      },
      {
        key: 'navigator.userAgent',
        value: nav?.userAgent?.slice(0, 80) ?? 'unknown',
      },
    ],
  };
}

function Verdict({
  label,
  value,
}: {
  label: string;
  value: boolean | 'unknown';
}) {
  const tone =
    value === 'unknown'
      ? 'neutral'
      : value
        ? 'danger'
        : 'success';
  const text =
    value === 'unknown' ? 'unknown' : value ? 'yes' : 'no';
  return (
    <View style={styles.verdictItem}>
      <Text style={styles.verdictLabel}>{label}</Text>
      <Badge label={text} tone={tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  verdictRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  verdictItem: {
    flexGrow: 1,
    flexBasis: 90,
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  verdictLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  signalRow: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  signalKey: {
    fontSize: 12,
    color: colors.muted,
    fontFamily: 'monospace',
  },
  signalValue: {
    fontSize: 13,
    color: colors.text,
    marginTop: 2,
  },
  signalNote: {
    fontSize: 11,
    color: colors.warning,
    marginTop: 2,
  },
});
