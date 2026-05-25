import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  getAudioFingerprint,
  getCanvasFingerprint,
  getHardwareData,
  getNetworkData,
  getScreenData,
} from 'ppl-a4-sdk-react-native';
import {
  getMobileHardwareData,
  getMobileNetworkData,
  getMobileScreenData,
} from '../shim/fingerprint-mobile';
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
      const result = isWeb ? await collectWeb() : await collectMobile();
      sdk.profiler.end('fingerprint.collect', {
        platform: Platform.OS,
        surfaces: isWeb ? 5 : 3,
      });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to collect fingerprint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <View style={styles.titleRow}>
        <SectionTitle>Fingerprint Collection</SectionTitle>
        <Badge
          label={isWeb ? 'Web surfaces' : 'Mobile shim'}
          tone={isWeb ? 'neutral' : 'success'}
        />
      </View>
      <Paragraph>
        {isWeb
          ? 'Web: audio context + canvas + navigator/screen data lewat SDK fingerprint primitives.'
          : 'Mobile: hardware + network + screen lewat expo-device + Dimensions (audio/canvas tidak tersedia native).'}
      </Paragraph>

      <Button
        label={loading ? 'Collecting…' : 'Collect Fingerprint'}
        onPress={collect}
        disabled={loading}
      />

      {error && <Text style={styles.error}>Error: {error}</Text>}

      {data && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.subheading}>
            Collected at {new Date(data.timestamp).toLocaleTimeString()}
          </Text>
          <Component title="Audio" value={data.audio} platformOnly={isWeb ? null : 'web'} />
          <Component title="Canvas" value={data.canvas} platformOnly={isWeb ? null : 'web'} />
          <Component title="Hardware" value={data.hardware} />
          <Component title="Network" value={data.network} />
          <Component title="Screen" value={data.screen} />
        </View>
      )}
    </Card>
  );
}

async function collectWeb(): Promise<Fingerprint> {
  const [audio, canvas] = await Promise.all([
    getAudioFingerprint(),
    getCanvasFingerprint(),
  ]);
  return {
    timestamp: Date.now(),
    audio,
    canvas,
    hardware: getHardwareData(),
    network: getNetworkData(),
    screen: getScreenData(),
  };
}

async function collectMobile(): Promise<Fingerprint> {
  return {
    timestamp: Date.now(),
    audio: null,
    canvas: null,
    hardware: getMobileHardwareData(),
    network: getMobileNetworkData(),
    screen: getMobileScreenData(),
  };
}

function Component({
  title,
  value,
  platformOnly,
}: {
  title: string;
  value: unknown;
  platformOnly?: 'web' | 'mobile' | null;
}) {
  const available = value !== null && value !== undefined;
  return (
    <View style={styles.component}>
      <View style={styles.componentHeader}>
        <Text style={styles.componentTitle}>{title}</Text>
        <Badge
          label={
            available
              ? 'OK'
              : platformOnly === 'web'
                ? 'Web-only'
                : 'N/A'
          }
          tone={available ? 'success' : 'neutral'}
        />
      </View>
      {available ? (
        <CodeBlock data={value} />
      ) : (
        <Text style={styles.naText}>
          {platformOnly === 'web'
            ? 'Surface ini butuh Web API (audio context / canvas) yang tidak tersedia di native.'
            : 'Not available on this platform'}
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
