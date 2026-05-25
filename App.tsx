import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  SokratechConfig,
  SokratechSDK,
} from 'ppl-a4-sdk-react-native';
import { buildConfig, defaultApiDomain, initSdk } from './sdk/sdk';
import { colors } from './components/ui';
import { FingerprintDemo } from './components/FingerprintDemo';
import { BehavioralDemo } from './components/BehavioralDemo';
import { ProfilingDemo } from './components/ProfilingDemo';
import { DetectionDemo } from './components/DetectionDemo';
import { AnalyzerDemo } from './components/AnalyzerDemo';
import { LoginDemo } from './components/LoginDemo';
import { RegisterDemo } from './components/RegisterDemo';
import { ConfigDemo } from './components/ConfigDemo';
import { FlushDemo } from './components/FlushDemo';

const TABS = [
  'config',
  'behavioral',
  'fingerprint',
  'detection',
  'flush',
  'analyzer',
  'register',
  'login',
  'profiling',
] as const;

type Tab = (typeof TABS)[number];

const INITIAL_CONFIG: SokratechConfig = buildConfig({
  apiDomain: defaultApiDomain,
  workflowId: '',
  profileId: '',
});

export default function App() {
  const [config, setConfig] = useState<SokratechConfig>(INITIAL_CONFIG);
  const [sdk, setSdk] = useState<SokratechSDK | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [active, setActive] = useState<Tab>('config');

  useEffect(() => {
    let cancelled = false;
    setInitError(null);
    setSdk(null);
    initSdk(config)
      .then((instance) => {
        if (!cancelled) setSdk(instance);
      })
      .catch((e) => {
        if (!cancelled)
          setInitError(e instanceof Error ? e.message : 'SDK init failed');
      });
    return () => {
      cancelled = true;
    };
  }, [config]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Sokratech SDK</Text>
          <Text style={styles.subtitle}>
            PoC React Native end-to-end with backend ingest
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              {sdk?.isInitialized() ? 'initialized' : 'initializing...'}
            </Text>
            <Text style={styles.meta}>platform: {Platform.OS}</Text>
          </View>
        </View>

        {initError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>SDK init error: {initError}</Text>
          </View>
        )}

        {!sdk && !initError && (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>
              Initializing SDK (fetching recipes from backend)...
            </Text>
          </View>
        )}

        {sdk && (
          <>
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
                    <Text
                      style={[styles.tabText, isActive && styles.tabTextActive]}
                    >
                      {tab}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.main}>
              {active === 'config' && (
                <ConfigDemo sdk={sdk} onApplyConfig={setConfig} />
              )}
              {active === 'behavioral' && <BehavioralDemo sdk={sdk} />}
              {active === 'fingerprint' && <FingerprintDemo sdk={sdk} />}
              {active === 'detection' && <DetectionDemo sdk={sdk} />}
              {active === 'flush' && <FlushDemo sdk={sdk} />}
              {active === 'analyzer' && <AnalyzerDemo />}
              {active === 'register' && <RegisterDemo />}
              {active === 'login' && <LoginDemo />}
              {active === 'profiling' && <ProfilingDemo sdk={sdk} />}
            </View>
          </>
        )}
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
  loading: { alignItems: 'center', padding: 24, gap: 12 },
  loadingText: { fontSize: 13, color: colors.muted, textAlign: 'center' },
  errorBanner: {
    backgroundColor: colors.dangerSoft,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
});
