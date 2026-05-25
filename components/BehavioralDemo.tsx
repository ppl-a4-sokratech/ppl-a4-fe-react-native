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
import {
  DragTracker,
  InputTracker,
  LifecycleTracker,
  ScrollTracker,
  SensorTracker,
  TouchTracker,
} from 'ppl-a4-sdk-react-native/behavioral';
import type { BehavioralPayload } from 'ppl-a4-sdk-react-native/behavioral/types';
import { sdk } from '../sdk/sdk';
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

export function BehavioralDemo() {
  const touch = useRef(new TouchTracker()).current;
  const scroll = useRef(new ScrollTracker().start()).current;
  const input = useRef(new InputTracker().start()).current;
  const drag = useRef(new DragTracker()).current;
  const lifecycle = useRef(new LifecycleTracker()).current;
  const sensor = useRef(new SensorTracker({ throttleMs: 250 })).current;

  const [payload, setPayload] = useState<BehavioralPayload | null>(null);
  const [drainCount, setDrainCount] = useState(0);
  const [sensorActive, setSensorActive] = useState(false);

  useEffect(() => {
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
  }, [lifecycle]);

  useEffect(() => {
    if (isWeb) return;

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
          sensor.start();
          setSensorActive(true);
        }
      } catch {}
    })();

    return () => {
      cancelled = true;
      accelSub?.remove();
      gyroSub?.remove();
      sensor.stop();
      setSensorActive(false);
    };
  }, [sensor]);

  const onTouchStart = (e: GestureResponderEvent) => {
    const t = e.nativeEvent;
    const id = safeTouchId(t.identifier);
    touch.onTouchStart(id, t.locationX, t.locationY, t.timestamp);
    drag.onDragStart(id, t.locationX, t.locationY, t.timestamp);
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    const t = e.nativeEvent;
    const id = safeTouchId(t.identifier);
    touch.onTouchEnd(id, t.locationX, t.locationY, t.timestamp);
    drag.onDragEnd(id, t.locationX, t.locationY, t.timestamp);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scroll.handleScroll(e.nativeEvent.contentOffset.y);
  };

  const simulateLifecycle = () => {
    lifecycle.onBackground();
    setTimeout(() => lifecycle.onForeground(), 350);
  };

  const drain = () => {
    sdk.profiler.start('behavioral.drain');
    const result: BehavioralPayload = {
      touchEvents: touch.drain(),
      scrollEvents: scroll.drain(),
      inputEvents: input.drain(),
      dragEvents: drag.drain(),
      lifecycleEvents: lifecycle.drain(),
      sensorEvents: sensor.drain(),
      capturedAt: Date.now(),
    };
    sdk.profiler.end('behavioral.drain', {
      events:
        result.touchEvents.length +
        result.scrollEvents.length +
        result.inputEvents.length +
        result.dragEvents.length +
        result.lifecycleEvents.length +
        result.sensorEvents.length,
    });
    setPayload(result);
    setDrainCount((c) => c + 1);
  };

  return (
    <View>
      <Card>
        <View style={styles.titleRow}>
          <SectionTitle>Behavioral Tracking</SectionTitle>
          <Badge
            label={isWeb ? 'Web ready' : 'Mobile ready'}
            tone={isWeb ? 'neutral' : 'success'}
          />
        </View>
        <Paragraph>
          SDK menangkap touch, drag, scroll, input focus, lifecycle, dan
          sensor. Touch/scroll/input dipakai dua-duanya di web dan mobile;
          drag/lifecycle/sensor di-wire khusus untuk mobile (sensor pakai
          accelerometer + gyroscope).
        </Paragraph>

        <View
          style={styles.touchpad}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Text style={styles.touchpadText}>
            Tap / tahan / geser di area ini
          </Text>
          <Text style={styles.touchpadHint}>
            Tap singkat = tap, tahan {'>'}300ms = longPress, geser {'>'}18px = drag
          </Text>
        </View>

        <TextInput
          placeholder="Ketik sesuatu di sini…"
          placeholderTextColor={colors.muted}
          style={styles.input}
          onFocus={() => input.onFocus('demo-field')}
          onBlur={() => input.onBlur('demo-field')}
        />

        <View style={styles.buttonRow}>
          <Button label="Drain Events" onPress={drain} />
          <Button
            label="Simulate Background"
            variant="secondary"
            onPress={simulateLifecycle}
          />
        </View>

        {payload && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.subheading}>
              Drain #{drainCount} —{' '}
              {new Date(payload.capturedAt).toLocaleTimeString()}
            </Text>
            <View style={styles.statRow}>
              <Stat label="Touch" value={payload.touchEvents.length} />
              <Stat label="Drag" value={payload.dragEvents.length} />
              <Stat label="Scroll" value={payload.scrollEvents.length} />
              <Stat label="Input" value={payload.inputEvents.length} />
            </View>
            <View style={styles.statRow}>
              <Stat
                label="Lifecycle"
                value={payload.lifecycleEvents.length}
              />
              <Stat label="Sensor" value={payload.sensorEvents.length} />
            </View>
            <CodeBlock data={payload} />
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle>Scroll Capture Area</SectionTitle>
        <Paragraph>
          Scroll di dalam kotak ini untuk menghasilkan scroll event yang
          ditangkap ScrollTracker.
        </Paragraph>
        <ScrollView
          style={styles.scrollBox}
          onScroll={onScroll}
          scrollEventThrottle={16}
          nestedScrollEnabled
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <Text key={i} style={styles.scrollLine}>
              Baris {i + 1} — scroll naik turun di sini
            </Text>
          ))}
        </ScrollView>
      </Card>

      <Card>
        <View style={styles.titleRow}>
          <SectionTitle>Sensor Stream</SectionTitle>
          <Badge
            label={
              isWeb
                ? 'Web: skipped'
                : sensorActive
                  ? 'Active'
                  : 'Unavailable'
            }
            tone={sensorActive ? 'success' : 'neutral'}
          />
        </View>
        <Paragraph>
          {isWeb
            ? 'Sensor accelerometer/gyroscope mobile-only — di web di-skip.'
            : sensorActive
              ? 'Accelerometer dan gyroscope sampling ~4Hz lewat expo-sensors. Goyangkan perangkat 3-5 detik lalu Drain.'
              : 'Sensor tidak tersedia di perangkat ini (atau emulator tanpa sensor virtual).'}
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
  scrollLine: {
    color: colors.muted,
    fontSize: 13,
    paddingVertical: 8,
  },
});
