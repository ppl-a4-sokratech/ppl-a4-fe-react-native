import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  useSokratech,
  type ProfileMetric,
} from '@ppl-sokratech-sdk/ppl-a4-sdk-react-native';
import { Badge, Button, Card, colors, Paragraph, SectionTitle } from './ui';

export function ProfilingDemo() {
  const { sdk } = useSokratech();
  const [metrics, setMetrics] = useState<ProfileMetric[]>(
    () => sdk?.getProfileMetrics() ?? []
  );

  const refresh = () => setMetrics([...(sdk?.getProfileMetrics() ?? [])]);
  const clear = () => {
    sdk?.clearProfileMetrics();
    setMetrics([]);
  };

  return (
    <Card>
      <SectionTitle>Profiling</SectionTitle>
      <Paragraph>
        Internal SDK timings. Trigger actions in other tabs, then refresh.
      </Paragraph>

      <View style={styles.toolbar}>
        <Button label="↻ Refresh" onPress={refresh} />
        <Button label="✕ Clear" variant="danger" onPress={clear} />
        <View style={{ justifyContent: 'center' }}>
          <Badge label={`${metrics.length} metric(s)`} />
        </View>
      </View>

      {metrics.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No metrics yet.</Text>
        </View>
      ) : (
        <View style={styles.table}>
          <View style={[styles.row, styles.headRow]}>
            <Text style={[styles.cell, styles.colNum, styles.headText]}>#</Text>
            <Text style={[styles.cell, styles.colOp, styles.headText]}>
              Operation
            </Text>
            <Text style={[styles.cell, styles.colDur, styles.headText]}>
              ms
            </Text>
          </View>
          {metrics.map((m, i) => (
            <View
              key={i}
              style={[styles.row, i % 2 === 1 && styles.rowAlt]}
            >
              <Text style={[styles.cell, styles.colNum]}>{i + 1}</Text>
              <Text style={[styles.cell, styles.colOp, styles.op]}>
                {m.operation}
              </Text>
              <Text style={[styles.cell, styles.colDur, styles.dur]}>
                {m.duration.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  empty: {
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 22,
    alignItems: 'center',
  },
  emptyText: { color: colors.text, fontWeight: '600' },
  emptyHint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row' },
  headRow: { backgroundColor: colors.bg },
  rowAlt: { backgroundColor: '#fafafa' },
  cell: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    fontSize: 13,
    color: colors.text,
  },
  headText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  colNum: { width: 36 },
  colOp: { flex: 1 },
  colDur: { width: 80, textAlign: 'right' },
  op: { fontFamily: 'monospace', color: colors.primary },
  dur: { fontFamily: 'monospace', color: colors.success, fontWeight: '600' },
});
