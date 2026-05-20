import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  getAudioFingerprint,
  getCanvasFingerprint,
  getHardwareData,
  getNetworkData,
  getScreenData,
} from 'ppl-a4-sdk-react-native';
import { sdk } from '../sdk/sdk';
import {
  Badge,
  Button,
  Card,
  CodeBlock,
  colors,
  Paragraph,
  SectionTitle,
} from './ui';

type Fingerprint = {
  timestamp: number;
  audio: unknown;
  canvas: unknown;
  hardware: unknown;
  network: unknown;
  screen: unknown;
};

const isWeb = Platform.OS === 'web';

export function FingerprintDemo() {
  const [data, setData] = useState<Fingerprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const collect = async () => {
    setLoading(true);
    setError(null);
    try {
      sdk.profiler.start('fingerprint.collect');
      const [audio, canvas] = await Promise.all([
        getAudioFingerprint(),
        getCanvasFingerprint(),
      ]);
      const result: Fingerprint = {
        timestamp: Date.now(),
        audio,
        canvas,
        hardware: getHardwareData(),
        network: getNetworkData(),
        screen: getScreenData(),
      };
      sdk.profiler.end('fingerprint.collect', { surfaces: 5 });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to collect fingerprint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <SectionTitle>Fingerprint Collection</SectionTitle>
      <Paragraph>
        Mengumpulkan device fingerprint dari audio context, canvas rendering,
        hardware, network, dan properti layar. Surface ini memakai Web API,
        jadi hanya aktif saat dijalankan di web.
      </Paragraph>

      {!isWeb ? (
        <View style={styles.notice}>
          <Badge label="Web-only" tone="warning" />
          <Text style={styles.noticeText}>
            Fingerprint surface SDK saat ini berbasis Web API (canvas, audio,
            navigator) sehingga belum tersedia di native. Buka PoC ini lewat
            Expo Web untuk mencoba.
          </Text>
        </View>
      ) : (
        <Button
          label={loading ? 'Collecting…' : 'Collect Fingerprint'}
          onPress={collect}
          disabled={loading}
        />
      )}

      {error && <Text style={styles.error}>Error: {error}</Text>}

      {data && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.subheading}>
            Collected at {new Date(data.timestamp).toLocaleTimeString()}
          </Text>
          <Component title="Audio" value={data.audio} />
          <Component title="Canvas" value={data.canvas} />
          <Component title="Hardware" value={data.hardware} />
          <Component title="Network" value={data.network} />
          <Component title="Screen" value={data.screen} />
        </View>
      )}
    </Card>
  );
}

function Component({ title, value }: { title: string; value: unknown }) {
  const available = value !== null && value !== undefined;
  return (
    <View style={styles.component}>
      <View style={styles.componentHeader}>
        <Text style={styles.componentTitle}>{title}</Text>
        <Badge
          label={available ? 'OK' : 'N/A'}
          tone={available ? 'success' : 'neutral'}
        />
      </View>
      {available ? (
        <CodeBlock data={value} />
      ) : (
        <Text style={styles.naText}>Not available on this platform</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: colors.warningSoft,
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  noticeText: { fontSize: 13, color: colors.warning, lineHeight: 19 },
  error: { color: colors.danger, fontWeight: '600', marginTop: 8 },
  subheading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  component: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 12,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  componentTitle: { fontSize: 14, fontWeight: '600', color: colors.primary },
  naText: { fontSize: 13, color: colors.muted, marginTop: 6 },
});
