import { useRef, useState } from 'react';
import {
  type GestureResponderEvent,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  InputTracker,
  ScrollTracker,
  TouchTracker,
  type BehavioralPayload,
} from 'ppl-a4-sdk-react-native';
import { sdk } from '../sdk/sdk';
import {
  Button,
  Card,
  CodeBlock,
  colors,
  Paragraph,
  SectionTitle,
  Stat,
} from './ui';

export function BehavioralDemo() {
  const touch = useRef(new TouchTracker()).current;
  const scroll = useRef(new ScrollTracker().start()).current;
  const input = useRef(new InputTracker().start()).current;

  const [payload, setPayload] = useState<BehavioralPayload | null>(null);
  const [drainCount, setDrainCount] = useState(0);

  const onTouchStart = (e: GestureResponderEvent) => {
    const t = e.nativeEvent;
    touch.onTouchStart(Number(t.identifier), t.locationX, t.locationY, t.timestamp);
  };
  const onTouchEnd = (e: GestureResponderEvent) => {
    const t = e.nativeEvent;
    touch.onTouchEnd(Number(t.identifier), t.locationX, t.locationY, t.timestamp);
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scroll.handleScroll(e.nativeEvent.contentOffset.y);
  };

  const drain = () => {
    sdk.profiler.start('behavioral.drain');
    const result: BehavioralPayload = {
      touchEvents: touch.drain(),
      scrollEvents: scroll.drain(),
      inputEvents: input.drain(),
      dragEvents: [],
      lifecycleEvents: [],
      sensorEvents: [],
      capturedAt: Date.now(),
    };
    sdk.profiler.end('behavioral.drain', {
      events:
        result.touchEvents.length +
        result.scrollEvents.length +
        result.inputEvents.length,
    });
    setPayload(result);
    setDrainCount((c) => c + 1);
  };

  return (
    <View>
      <Card>
        <SectionTitle>Behavioral Tracking</SectionTitle>
        <Paragraph>
          SDK menangkap event tap/touch, scroll, dan fokus input secara
          real-time lewat TouchTracker, ScrollTracker, dan InputTracker. Sentuh
          area di bawah, scroll halaman, dan ketik di field, lalu tekan Drain.
        </Paragraph>

        <View
          style={styles.touchpad}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Text style={styles.touchpadText}>
            Tap / tahan / geser di area ini
          </Text>
        </View>

        <TextInput
          placeholder="Ketik sesuatu di sini…"
          placeholderTextColor={colors.muted}
          style={styles.input}
          onFocus={() => input.onFocus('demo-field')}
          onBlur={() => input.onBlur('demo-field')}
        />

        <Button label="Drain Events" onPress={drain} />

        {payload && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.subheading}>
              Drain #{drainCount} —{' '}
              {new Date(payload.capturedAt).toLocaleTimeString()}
            </Text>
            <View style={styles.statRow}>
              <Stat label="Touch" value={payload.touchEvents.length} />
              <Stat label="Scroll" value={payload.scrollEvents.length} />
              <Stat label="Input" value={payload.inputEvents.length} />
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
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <Text key={i} style={styles.scrollLine}>
              Baris {i + 1} — scroll naik turun di sini
            </Text>
          ))}
        </ScrollView>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  touchpadText: { color: colors.primary, fontWeight: '600' },
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
