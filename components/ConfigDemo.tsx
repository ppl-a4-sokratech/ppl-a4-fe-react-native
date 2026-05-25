import { StyleSheet, Text, View } from 'react-native';
import type { SokratechSDK } from 'ppl-a4-sdk-react-native';
import { Badge, Card, CodeBlock, colors, Paragraph, SectionTitle } from './ui';

export function ConfigDemo({ sdk }: { sdk: SokratechSDK }) {
  const config = sdk.getConfig();
  const recipes = config.recipes;
  const usingRemote = Boolean(config.workflowId && config.profileId);

  return (
    <Card>
      <View style={styles.titleRow}>
        <SectionTitle>SDK Config</SectionTitle>
        <Badge
          label={usingRemote ? 'Remote recipes' : 'Local recipes'}
          tone={usingRemote ? 'success' : 'neutral'}
        />
      </View>
      <Paragraph>
        Config and recipes the SDK resolved on initialization. With workflowId
        and profileId set, the SDK calls GET /sdk/v1/config to fetch recipes
        from the backend. Otherwise, the SDK uses the local fallback or all-true
        defaults.
      </Paragraph>

      <Text style={styles.label}>API domain</Text>
      <Text style={styles.value}>{config.apiDomain}</Text>

      <Text style={styles.label}>Workflow / Profile</Text>
      <Text style={styles.value}>
        {config.workflowId ?? 'unset'} / {config.profileId ?? 'unset'}
      </Text>

      <Text style={styles.label}>Ingest endpoint</Text>
      <Text style={styles.value}>
        {config.ingestEndpoint ?? '/ingest (default)'}
      </Text>

      <Text style={styles.label}>Resolved recipes</Text>
      <CodeBlock data={recipes} />

      <Text style={styles.label}>Collector status</Text>
      <View style={styles.statusGrid}>
        <StatusChip
          label="Behavioral"
          ready={sdk.getBehavioralCollector() !== null}
        />
        <StatusChip
          label="Fingerprint"
          ready={sdk.getFingerprintCollector() !== null}
        />
        <StatusChip
          label="Detection"
          ready={sdk.getDetectionCollector() !== null}
        />
      </View>
    </Card>
  );
}

function StatusChip({ label, ready }: { label: string; ready: boolean }) {
  return (
    <View style={[styles.chip, ready ? styles.chipOn : styles.chipOff]}>
      <Text style={[styles.chipText, { color: ready ? colors.success : colors.muted }]}>
        {label}: {ready ? 'on' : 'off'}
      </Text>
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
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 4,
  },
  value: { fontSize: 13, color: colors.text, fontFamily: 'monospace' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipOn: { backgroundColor: colors.successSoft, borderColor: colors.success },
  chipOff: { backgroundColor: colors.bg, borderColor: colors.border },
  chipText: { fontSize: 12, fontWeight: '600' },
});
