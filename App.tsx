import { useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { sdk } from './sdk/sdk';
import { colors } from './components/ui';
import { FingerprintDemo } from './components/FingerprintDemo';
import { BehavioralDemo } from './components/BehavioralDemo';
import { ProfilingDemo } from './components/ProfilingDemo';
import { DetectionDemo } from './components/DetectionDemo';
import { AnalyzerDemo } from './components/AnalyzerDemo';
import { LoginDemo } from './components/LoginDemo';
import { RegisterDemo } from './components/RegisterDemo';

const TABS = [
  'behavioral',
  'fingerprint',
  'detection',
  'analyzer',
  'register',
  'login',
  'profiling',
] as const;

type Tab = (typeof TABS)[number];

export default function App() {
  const [active, setActive] = useState<Tab>('behavioral');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Sokratech SDK</Text>
          <Text style={styles.subtitle}>
            PoC React Native — Behavioral, Fingerprint & Profiling
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              {sdk.isInitialized() ? '● initialized' : '○ not initialized'}
            </Text>
            <Text style={styles.meta}>platform: {Platform.OS}</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarInner}
        >
          {TABS.map((tab) => {
            const isActive = tab === active;
            return (
              <Pressable
                key={tab}
                onPress={() => setActive(tab)}
                style={[styles.tab, isActive && styles.tabActive]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.main}>
          {active === 'behavioral' && <BehavioralDemo />}
          {active === 'fingerprint' && <FingerprintDemo />}
          {active === 'detection' && <DetectionDemo />}
          {active === 'analyzer' && <AnalyzerDemo />}
          {active === 'register' && <RegisterDemo />}
          {active === 'login' && <LoginDemo />}
          {active === 'profiling' && <ProfilingDemo />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, maxWidth: 760, width: '100%', alignSelf: 'center' },
  header: { marginBottom: 16, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  metaRow: { flexDirection: 'row', gap: 14, marginTop: 8 },
  meta: { fontSize: 12, color: colors.muted, fontFamily: 'monospace' },
  tabBar: { marginBottom: 16, flexGrow: 0 },
  tabBarInner: { gap: 6, paddingVertical: 2 },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'capitalize',
  },
  tabTextActive: { color: '#fff' },
  main: { width: '100%' },
});
