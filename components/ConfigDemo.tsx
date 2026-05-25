import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type {
  SokratechConfig,
  SokratechSDK,
} from 'ppl-a4-sdk-react-native';
import { buildConfig } from '../sdk/sdk';
import {
  Badge,
  Button,
  Card,
  CodeBlock,
  colors,
  Paragraph,
  SectionTitle,
} from './ui';

interface ConfigDemoProps {
  sdk: SokratechSDK;
  onApplyConfig: (config: SokratechConfig) => void;
}

export function ConfigDemo({ sdk, onApplyConfig }: ConfigDemoProps) {
  const current = sdk.getConfig();
  const [apiDomain, setApiDomain] = useState(current.apiDomain);
  const [workflowId, setWorkflowId] = useState(current.workflowId ?? '');
  const [profileId, setProfileId] = useState(current.profileId ?? '');

  const usingRemote = Boolean(current.workflowId && current.profileId);

  const handleApply = () => {
    onApplyConfig(buildConfig({ apiDomain, workflowId, profileId }));
  };

  return (
    <View>
      <Card>
        <View style={styles.titleRow}>
          <SectionTitle>SDK Config</SectionTitle>
          <Badge
            label={usingRemote ? 'Remote recipes' : 'Local fallback'}
            tone={usingRemote ? 'success' : 'neutral'}
          />
        </View>
        <Paragraph>
          Set the API domain and the workflow + profile IDs from the admin
          portal. When both IDs are present the SDK fetches recipes via GET
          /sdk/v1/config; otherwise it uses local all-true defaults. Apply
          reinitializes the SDK with the new config.
        </Paragraph>

        <Text style={styles.fieldLabel}>API domain</Text>
        <TextInput
          style={styles.input}
          value={apiDomain}
          onChangeText={setApiDomain}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="http://localhost:3000"
          placeholderTextColor={colors.muted}
        />

        <Text style={styles.fieldLabel}>Workflow ID</Text>
        <TextInput
          style={styles.input}
          value={workflowId}
          onChangeText={setWorkflowId}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="leave blank for local recipes"
          placeholderTextColor={colors.muted}
        />

        <Text style={styles.fieldLabel}>Profile ID</Text>
        <TextInput
          style={styles.input}
          value={profileId}
          onChangeText={setProfileId}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="leave blank for local recipes"
          placeholderTextColor={colors.muted}
        />

        <Button label="Apply and Reinitialize" onPress={handleApply} />
      </Card>

      <Card>
        <SectionTitle>Resolved State</SectionTitle>
        <Paragraph>
          What the SDK is currently running with after the last init.
        </Paragraph>

        <Text style={styles.label}>API domain</Text>
        <Text style={styles.value}>{current.apiDomain}</Text>

        <Text style={styles.label}>Workflow / Profile</Text>
        <Text style={styles.value}>
          {current.workflowId ?? 'unset'} / {current.profileId ?? 'unset'}
        </Text>

        <Text style={styles.label}>Resolved recipes</Text>
        <CodeBlock data={current.recipes} />

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
    </View>
  );
}

function StatusChip({ label, ready }: { label: string; ready: boolean }) {
  return (
    <View style={[styles.chip, ready ? styles.chipOn : styles.chipOff]}>
      <Text
        style={[
          styles.chipText,
          { color: ready ? colors.success : colors.muted },
        ]}
      >
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
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#fff',
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
