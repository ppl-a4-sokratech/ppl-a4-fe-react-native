import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { SokratechSDK } from 'ppl-a4-sdk-react-native';
import { Button, Card, colors, SectionTitle } from './ui';

interface IngestResponseData {
  decision: string;
  requestId?: string;
  status?: number;
}

interface TimingResult {
  analyzeMs: number;
  fingerprintMs: number;
  detectMs: number;
  fetchMs: number;
  cached: boolean;
}

type Source = 'backend' | 'mock';

function hasDecision(data: unknown): data is IngestResponseData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'decision' in data &&
    typeof (data as { decision: unknown }).decision === 'string'
  );
}

function createMockResponse(): IngestResponseData {
  return {
    decision: 'PASS',
    requestId: `mock-${Date.now().toString(36)}`,
    status: 200,
  };
}

export function LoginDemo({ sdk }: { sdk: SokratechSDK }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestResponseData | null>(null);
  const [timing, setTiming] = useState<TimingResult | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const [useCache, setUseCache] = useState(false);
  const [cacheWarmed, setCacheWarmed] = useState(false);
  const [warming, setWarming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    sdk.drainBehavioralEvents();
  }, [sdk]);

  const toggleCache = async (next: boolean) => {
    setUseCache(next);
    setCacheWarmed(false);
    if (next) {
      setWarming(true);
      try {
        await sdk.collectFingerprint(true);
        setCacheWarmed(true);
      } finally {
        setWarming(false);
      }
    }
  };

  const now = (): number =>
    typeof performance !== 'undefined' ? performance.now() : Date.now();

  const submit = async () => {
    setLoading(true);
    setResult(null);
    setTiming(null);
    setSource(null);
    setErrorMsg(null);

    try {
      const analyzeMs = 0;

      const t0Fp = now();
      await sdk.collectFingerprint(!useCache);
      const fingerprintMs = now() - t0Fp;

      const t0Det = now();
      await sdk.detect(true);
      const detectMs = now() - t0Det;

      const t0Fetch = now();
      let payload: IngestResponseData;
      let src: Source = 'backend';
      try {
        const response = await sdk.flushIngest();
        if (!response.ok || !hasDecision(response.data)) {
          throw new Error(response.ok ? 'invalid response' : response.error);
        }
        payload = response.data;
      } catch (e) {
        src = 'mock';
        payload = createMockResponse();
        setErrorMsg(e instanceof Error ? e.message : 'flushIngest failed');
      }
      const fetchMs = now() - t0Fetch;

      setTiming({ analyzeMs, fingerprintMs, detectMs, fetchMs, cached: useCache });
      setResult(payload);
      setSource(src);
    } finally {
      setLoading(false);
    }
  };

  const collector = sdk.getBehavioralCollector();
  const isPass = result?.decision === 'PASS';

  return (
    <Card>
      <SectionTitle>Login</SectionTitle>

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Username"
        placeholderTextColor={colors.muted}
        onFocus={() => collector?.inputTracker?.onFocus('login-username')}
        onBlur={() => collector?.inputTracker?.onBlur('login-username')}
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Password"
        placeholderTextColor={colors.muted}
        onFocus={() => collector?.inputTracker?.onFocus('login-password')}
        onBlur={() => collector?.inputTracker?.onBlur('login-password')}
      />

      <View style={styles.toggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.toggleTitle}>Use cached fingerprint</Text>
          <Text style={styles.toggleSubtitle}>
            {warming
              ? 'Warming cache...'
              : useCache && cacheWarmed
                ? 'Cache ready'
                : 'Pre-warms on toggle'}
          </Text>
        </View>
        <Pressable
          onPress={() => toggleCache(!useCache)}
          disabled={warming}
          style={[
            styles.toggleTrack,
            useCache ? styles.toggleTrackOn : styles.toggleTrackOff,
            warming && { opacity: 0.5 },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              { transform: [{ translateX: useCache ? 20 : 0 }] },
            ]}
          />
        </Pressable>
      </View>

      <Button
        label={loading ? 'Verifying & Logging in...' : 'Login'}
        onPress={submit}
        disabled={
          loading ||
          warming ||
          username.length === 0 ||
          password.length === 0
        }
      />

      {result && (
        <View
          style={[
            styles.banner,
            isPass ? styles.bannerSuccess : styles.bannerError,
          ]}
        >
          <Text
            style={[
              styles.bannerText,
              isPass ? styles.bannerTextSuccess : styles.bannerTextError,
            ]}
          >
            Login decision: {result.decision}
          </Text>
        </View>
      )}

      {timing && <TimingBreakdown timing={timing} />}

      {result && (
        <View style={styles.ingestBox}>
          <Text style={styles.ingestLabel}>Ingest Result</Text>
          <Text style={styles.ingestLine}>
            <Text style={styles.ingestKey}>Decision: </Text>
            {result.decision}
          </Text>
          {result.requestId && (
            <Text style={styles.ingestLine}>
              <Text style={styles.ingestKey}>Request ID: </Text>
              <Text style={styles.mono}>{result.requestId}</Text>
            </Text>
          )}
          {result.status !== undefined && (
            <Text style={styles.ingestLine}>
              <Text style={styles.ingestKey}>Status: </Text>
              {result.status}
            </Text>
          )}
          {source && (
            <Text style={styles.ingestLine}>
              <Text style={styles.ingestKey}>Source: </Text>
              {source}
            </Text>
          )}
          {errorMsg && source === 'mock' && (
            <Text style={styles.errorHint}>fallback reason: {errorMsg}</Text>
          )}
        </View>
      )}
    </Card>
  );
}

function TimingBreakdown({ timing: t }: { timing: TimingResult }) {
  const sdkMs = t.analyzeMs + t.fingerprintMs + t.detectMs;
  const totalMs = sdkMs + t.fetchMs;
  const overheadPct = t.fetchMs > 0 ? ((sdkMs / t.fetchMs) * 100).toFixed(0) : '0';

  const row = (label: string, ms: number, muted = false, bold = false) => (
    <View style={styles.row}>
      <Text
        style={[
          styles.rowLabel,
          muted && styles.muted,
          bold && styles.boldText,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.rowValue,
          muted && styles.muted,
          bold && styles.boldText,
        ]}
      >
        {ms.toFixed(2)} ms
      </Text>
    </View>
  );

  return (
    <View style={styles.timing}>
      <Text style={styles.timingTitle}>Timing Breakdown</Text>
      {row('Behavioral Analysis', t.analyzeMs, true)}
      {row('Fingerprint Collection', t.fingerprintMs, true)}
      {row('Bot Detection', t.detectMs, true)}
      <View style={styles.divider} />
      {row('SDK Data Collection (subtotal)', sdkMs)}
      {row('API Request (fetch only)', t.fetchMs)}
      <View style={styles.divider} />
      {row('Total with SDK', totalMs, false, true)}
      <Text style={styles.timingNote}>
        SDK added <Text style={styles.overhead}>{sdkMs.toFixed(2)} ms</Text>{' '}
        overhead ({overheadPct}% of fetch time). Without SDK ~
        {t.fetchMs.toFixed(2)} ms.
      </Text>
      <Text style={styles.timingNote}>
        Fingerprint mode:{' '}
        <Text style={t.cached ? styles.cacheHit : styles.cacheFresh}>
          {t.cached ? 'Cache hit (pre-warmed)' : 'Fresh collection (no cache)'}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.bg,
    marginBottom: 14,
  },
  toggleTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  toggleSubtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 999,
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackOn: { backgroundColor: colors.success },
  toggleTrackOff: { backgroundColor: colors.border },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  banner: {
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    alignItems: 'center',
  },
  bannerSuccess: { backgroundColor: colors.successSoft },
  bannerError: { backgroundColor: colors.dangerSoft },
  bannerText: { fontSize: 14, fontWeight: '600' },
  bannerTextSuccess: { color: colors.success },
  bannerTextError: { color: colors.danger },
  timing: {
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
  },
  timingTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  rowLabel: { fontSize: 13, color: colors.text },
  rowValue: {
    fontSize: 13,
    color: colors.text,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  muted: { color: colors.muted },
  boldText: { fontWeight: '800', color: colors.text },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },
  timingNote: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 6,
  },
  overhead: { color: colors.warning, fontWeight: '700' },
  cacheHit: { color: colors.success, fontWeight: '700' },
  cacheFresh: { color: colors.primary, fontWeight: '700' },
  ingestBox: {
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
  },
  ingestLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  ingestLine: { fontSize: 13, color: colors.text, paddingVertical: 2 },
  ingestKey: { fontWeight: '700' },
  mono: { fontFamily: 'monospace', fontSize: 12 },
  errorHint: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
