import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { DetectionResult, SokratechSDK } from 'ppl-a4-sdk-react-native';
import {
  Badge,
  Button,
  Card,
  CodeBlock,
  colors,
  Paragraph,
  SectionTitle,
} from './ui';

const isWeb = Platform.OS === 'web';

export function DetectionDemo({ sdk }: { sdk: SokratechSDK }) {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const next = await sdk.detect(true);
      setResult(next);
    } finally {
      setLoading(false);
    }
  };

  const hasDetection = sdk.getDetectionCollector() !== null;

  return (
    <Card>
      <View style={styles.titleRow}>
        <SectionTitle>Detection</SectionTitle>
        <Badge
          label={isWeb ? 'webDriver' : 'emulator'}
          tone={hasDetection ? 'success' : 'neutral'}
        />
      </View>
      <Paragraph>
        Check for emulator (mobile) or webDriver (web) markers via SDK.
      </Paragraph>

      <Button
        label={loading ? 'Running...' : 'Run'}
        onPress={run}
        disabled={loading || !hasDetection}
      />

      {result && (
        <View style={{ marginTop: 12 }}>
          <View style={styles.verdictRow}>
            <Verdict label="Emulator" value={result.emulator} />
            <Verdict label="WebDriver" value={result.webDriver} />
          </View>
          <Text style={styles.subheading}>Raw result</Text>
          <CodeBlock data={result} />
        </View>
      )}
    </Card>
  );
}

function Verdict({ label, value }: { label: string; value: boolean | undefined }) {
  const tone =
    value === undefined ? 'neutral' : value ? 'danger' : 'success';
  const text =
    value === undefined ? 'not run' : value ? 'detected' : 'clean';
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
    flexBasis: 120,
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  verdictLabel: { fontSize: 12, fontWeight: '600', color: colors.muted },
  subheading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
});
