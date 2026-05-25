import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { IngestApiResponse, SokratechSDK } from 'ppl-a4-sdk-react-native';
import {
  Badge,
  Button,
  Card,
  CodeBlock,
  colors,
  Paragraph,
  SectionTitle,
} from './ui';

export function FlushDemo({ sdk }: { sdk: SokratechSDK }) {
  const [response, setResponse] = useState<IngestApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const flush = async () => {
    setLoading(true);
    try {
      const next = await sdk.flushIngest();
      setResponse(next);
      setCount((c) => c + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <View style={styles.titleRow}>
        <SectionTitle>Flush to Backend</SectionTitle>
        {response && (
          <Badge
            label={response.ok ? `${response.status} OK` : `${response.status} fail`}
            tone={response.ok ? 'success' : 'danger'}
          />
        )}
      </View>
      <Paragraph>
        Drains behavioral events, collects fingerprint, runs detection, packs
        them into one ingest request, and POSTs to /ingest. The backend
        forwards to analyze-service and returns a decision plus signal flags.
      </Paragraph>

      <Button
        label={loading ? 'Flushing...' : 'Flush to /ingest'}
        onPress={flush}
        disabled={loading}
      />

      {response && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.subheading}>
            Response #{count} ({response.ok ? 'success' : 'failure'})
          </Text>
          {response.ok ? (
            <>
              {response.data && hasDecision(response.data) && (
                <View style={styles.decisionBox}>
                  <Text style={styles.decisionLabel}>Decision</Text>
                  <Text style={styles.decisionValue}>
                    {response.data.decision}
                  </Text>
                </View>
              )}
              <Text style={styles.subheading}>Raw response</Text>
              <CodeBlock data={response.data} />
            </>
          ) : (
            <>
              <Text style={styles.errorText}>Error: {response.error}</Text>
              {response.details !== undefined && (
                <CodeBlock data={response.details} />
              )}
            </>
          )}
        </View>
      )}
    </Card>
  );
}

function hasDecision(data: unknown): data is { decision: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'decision' in data &&
    typeof (data as { decision: unknown }).decision === 'string'
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 10,
  },
  decisionBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  decisionLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  decisionValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  errorText: { color: colors.danger, fontWeight: '600', marginTop: 8 },
});
