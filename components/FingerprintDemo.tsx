import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type {
  CollectedFingerprint,
  SokratechSDK,
} from 'ppl-a4-sdk-react-native';
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

export function FingerprintDemo({ sdk }: { sdk: SokratechSDK }) {
  const [data, setData] = useState<CollectedFingerprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const collect = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.collectFingerprint(true);
      setData(result);
      if (!result) {
        setError('Fingerprint collector is disabled in the resolved config.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to collect fingerprint');
    } finally {
      setLoading(false);
    }
  };

  const hasFingerprint = sdk.getFingerprintCollector() !== null;

  return (
    <Card>
      <View style={styles.titleRow}>
        <SectionTitle>Fingerprint Collection</SectionTitle>
        <Badge
          label={isWeb ? 'Web surfaces' : 'Native surfaces'}
          tone={hasFingerprint ? 'success' : 'neutral'}
        />
      </View>
      <Paragraph>
        Collects via SDK FingerprintCollector. Web fills audio, canvas,
        graphics, fonts, device, and screen. Mobile fills device (via
        react-native-device-info) and screen, while audio / canvas / graphics
        return null.
      </Paragraph>

      <Button
        label={loading ? 'Collecting...' : 'Collect Fingerprint'}
        onPress={collect}
        disabled={loading || !hasFingerprint}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      {data && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.subheading}>
            Collected at {new Date(data.timestamp).toLocaleTimeString()}
          </Text>
          <Surface title="Audio" value={data.audio} webOnly />
          <Surface title="Canvas" value={data.canvas} webOnly />
          <Surface title="Graphics" value={data.graphics} webOnly />
          <Surface title="Fonts" value={data.fonts} webOnly />
          <Surface title="Device" value={data.device} />
          <Surface title="Screen" value={data.screen} />
        </View>
      )}
    </Card>
  );
}

function Surface({
  title,
  value,
  webOnly,
}: {
  title: string;
  value: unknown;
  webOnly?: boolean;
}) {
  const available = value !== null && value !== undefined;
  return (
    <View style={styles.surface}>
      <View style={styles.surfaceHeader}>
        <Text style={styles.surfaceTitle}>{title}</Text>
        <Badge
          label={
            available ? 'OK' : webOnly && !isWeb ? 'Web-only' : 'N/A'
          }
          tone={available ? 'success' : 'neutral'}
        />
      </View>
      {available ? (
        <CodeBlock data={value} />
      ) : (
        <Text style={styles.naText}>
          {webOnly && !isWeb
            ? 'Surface requires Web APIs not available in native.'
            : 'Not available on this platform.'}
        </Text>
      )}
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
  error: { color: colors.danger, fontWeight: '600', marginTop: 8 },
  subheading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  surface: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 12,
  },
  surfaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  surfaceTitle: { fontSize: 14, fontWeight: '600', color: colors.primary },
  naText: { fontSize: 13, color: colors.muted, marginTop: 6 },
});
