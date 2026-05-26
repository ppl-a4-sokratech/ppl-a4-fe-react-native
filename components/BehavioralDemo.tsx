import { useEffect, useRef, useState } from 'react';
import {
  AppState,
  type AppStateStatus,
  type GestureResponderEvent,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import type { BehavioralPayload, SokratechSDK } from 'ppl-a4-sdk-react-native';
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

function safeTouchId(raw: unknown): number {
  const candidate = Number(raw);
  return Number.isFinite(candidate) ? candidate : Date.now();
}

export function BehavioralDemo({ sdk }: { sdk: SokratechSDK }) {
  const collector = sdk.getBehavioralCollector();
  const touchIdRef = useRef(0);

  const [payload, setPayload] = useState<BehavioralPayload | null>(null);
  const [drainCount, setDrainCount] = useState(0);
  const [sensorActive, setSensorActive] = useState(false);

  useEffect(() => {
    const lifecycle = collector?.lifecycleTracker;
    if (!lifecycle) return;
    const subscription = AppState.addEventListener(
      'change',
      (next: AppStateStatus) => {
        if (next === 'background' || next === 'inactive') {
          lifecycle.onBackground();
        } else if (next === 'active') {
          lifecycle.onForeground();
        }
      }
    );
    return () => subscription.remove();
  }, [collector]);

  useEffect(() => {
    if (isWeb) return;
    const sensor = collector?.sensorTracker;
    if (!sensor) return;

    let cancelled = false;
    let accelSub: { remove: () => void } | null = null;
    let gyroSub: { remove: () => void } | null = null;

    (async () => {
      try {
        const accelAvailable = await Accelerometer.isAvailableAsync();
        const gyroAvailable = await Gyroscope.isAvailableAsync();
        if (cancelled) return;

        if (accelAvailable) {
          Accelerometer.setUpdateInterval(250);
          accelSub = Accelerometer.addListener(({ x, y, z }) => {
            sensor.onAccelerometer(x, y, z);
          });
        }
        if (gyroAvailable) {
          Gyroscope.setUpdateInterval(250);
          gyroSub = Gyroscope.addListener(({ x, y, z }) => {
            sensor.onGyroscope(x, y, z);
          });
        }
        if (accelAvailable || gyroAvailable) {
          setSensorActive(true);
        }
      } catch {}
    })();

    return () => {
      cancelled = true;
      accelSub?.remove();
      gyroSub?.remove();
      setSensorActive(false);
    };
  }, [collector]);

  if (!collector) {
    return (
      <Card>
        <SectionTitle>Behavioral</SectionTitle>
        <Paragraph>Recipe disabled.</Paragraph>
      </Card>
    );
  }

  const onTouchStart = (e: GestureResponderEvent) => {
    const t = e.nativeEvent;
    const id = safeTouchId(t.identifier);
    touchIdRef.current = id;
    collector.touchTracker?.onTouchStart(id, t.locationX, t.locationY, t.timestamp);
    collector.dragTracker?.onDragStart(id, t.locationX, t.locationY, t.timestamp);
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    const t = e.nativeEvent;
    const id = safeTouchId(t.identifier);
    collector.touchTracker?.onTouchEnd(id, t.locationX, t.locationY, t.timestamp);
    collector.dragTracker?.onDragEnd(id, t.locationX, t.locationY, t.timestamp);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    collector.scrollTracker?.handleScroll(e.nativeEvent.contentOffset.y);
  };

  const simulateLifecycle = () => {
    collector.lifecycleTracker?.onBackground();
    setTimeout(() => collector.lifecycleTracker?.onForeground(), 350);
  };

  const drain = () => {
    const result = sdk.drainBehavioralEvents();
    if (result) {
      setPayload(result);
      setDrainCount((c) => c + 1);
    }
  };

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

        <View
          style={styles.touchpad}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Text style={styles.touchpadText}>Tap / hold / drag</Text>
        </View>

        <TextInput
          placeholder="Type here..."
          placeholderTextColor={colors.muted}
          style={styles.input}
          onFocus={() => collector.inputTracker?.onFocus('demo-field')}
          onBlur={() => collector.inputTracker?.onBlur('demo-field')}
        />

        <View style={styles.buttonRow}>
          <Button label="Drain" onPress={drain} />
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
            </View>
            <CodeBlock data={payload} />
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle>Scroll</SectionTitle>
        <Paragraph>Scroll inside the box to record scroll events.</Paragraph>
        <ScrollView
          style={styles.scrollBox}
          onScroll={onScroll}
          scrollEventThrottle={16}
          nestedScrollEnabled
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <Text key={i} style={styles.scrollLine}>
              Line {i + 1}
            </Text>
          ))}
        </ScrollView>
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
              ? 'Shake or tilt the device, then drain.'
              : 'Sensors not available on this device.'}
        </Paragraph>
      </Card>
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
