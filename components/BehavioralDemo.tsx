import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  TrackedPressable,
  TrackedScrollView,
  TrackedTextInput,
  useBehavioral,
  useSokratech,
  type BehavioralPayload,
} from '@ppl-sokratech-sdk/ppl-a4-sdk-react-native';
import {
  Badge,
  Button,
  Card,
  CodeBlock,
  colors,
  Paragraph,
  SectionTitle,
  Stat,
} from './ui';

const isWeb = Platform.OS === 'web';

export function BehavioralDemo() {
  const { sdk } = useSokratech();
  const { collector, drain } = useBehavioral();
  const [payload, setPayload] = useState<BehavioralPayload | null>(null);
  const [drainCount, setDrainCount] = useState(0);

  if (!collector) {
    return (
      <Card>
        <SectionTitle>Behavioral</SectionTitle>
        <Paragraph>Recipe disabled.</Paragraph>
      </Card>
    );
  }

  const simulateLifecycle = () => {
    collector.lifecycleTracker?.onBackground();
    setTimeout(() => collector.lifecycleTracker?.onForeground(), 350);
  };

  const handleDrain = () => {
    const result = drain();
    if (result) {
      setPayload(result);
      setDrainCount((c) => c + 1);
    }
  };

  const sensorActive = !isWeb && collector.sensorTracker !== undefined;

  return (
    <View>
      <Card>
        <View style={styles.titleRow}>
          <SectionTitle>Behavioral</SectionTitle>
          <Badge label="SDK collector" tone="success" />
        </View>
        <Paragraph>
          Interact below to record events, then drain the buffer.
        </Paragraph>

        <TrackedPressable style={styles.touchpad}>
          <Text style={styles.touchpadText}>Tap / hold / drag</Text>
          <Text style={styles.touchpadHint}>
            quick tap = tap, hold = longPress, swipe = drag
          </Text>
          {isWeb && (
            <Text style={styles.touchpadHint}>
              hover here to record cursor moves
            </Text>
          )}
        </TrackedPressable>

        <TrackedTextInput
          trackId="behavioral-field"
          placeholder="Type here..."
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        <View style={styles.buttonRow}>
          <Button label="Drain" onPress={handleDrain} />
          <Button
            label="Simulate background"
            variant="secondary"
            onPress={simulateLifecycle}
          />
        </View>

        {payload && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.subheading}>
              Drain #{drainCount} ({new Date(payload.capturedAt).toLocaleTimeString()})
            </Text>
            <View style={styles.statRow}>
              <Stat label="Touch" value={payload.touchEvents.length} />
              <Stat label="Drag" value={payload.dragEvents.length} />
              <Stat label="Scroll" value={payload.scrollEvents.length} />
              <Stat label="Input" value={payload.inputEvents.length} />
            </View>
            <View style={styles.statRow}>
              <Stat label="Lifecycle" value={payload.lifecycleEvents.length} />
              <Stat label="Sensor" value={payload.sensorEvents.length} />
              {isWeb && (
                <>
                  <Stat label="Move" value={payload.moveEvents?.length ?? 0} />
                  <Stat label="Keys" value={payload.keyEvents?.length ?? 0} />
                </>
              )}
            </View>
            <CodeBlock data={payload} />
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle>Scroll</SectionTitle>
        <Paragraph>Scroll inside the box to record scroll events.</Paragraph>
        <TrackedScrollView style={styles.scrollBox} nestedScrollEnabled>
          {Array.from({ length: 20 }).map((_, i) => (
            <Text key={i} style={styles.scrollLine}>
              Line {i + 1}
            </Text>
          ))}
        </TrackedScrollView>
      </Card>

      <Card>
        <View style={styles.titleRow}>
          <SectionTitle>Sensor</SectionTitle>
          <Badge
            label={
              isWeb ? 'web: skipped' : sensorActive ? 'active' : 'unavailable'
            }
            tone={sensorActive ? 'success' : 'neutral'}
          />
        </View>
        <Paragraph>
          {isWeb
            ? 'Sensors are mobile-only.'
            : sensorActive
              ? 'Shake or tilt the device, then drain. SDK provider auto-wires accelerometer + gyroscope.'
              : 'Sensors not available on this device.'}
        </Paragraph>
      </Card>
    </View>
  );
  // sdk is exposed via useSokratech but BehavioralDemo no longer needs it
  void sdk;
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  touchpad: {
    height: 130,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  touchpadText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  touchpadHint: {
    color: colors.primary,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    marginBottom: 14,
  },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap' },
  subheading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 10,
  },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  scrollBox: {
    height: 120,
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 12,
  },
  scrollLine: { color: colors.muted, fontSize: 13, paddingVertical: 8 },
});
