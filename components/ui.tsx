import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

export const colors = {
  bg: '#f4f4f7',
  card: '#ffffff',
  border: '#e3e3ea',
  text: '#18181b',
  muted: '#71717a',
  primary: '#4361ee',
  primarySoft: '#eef1ff',
  success: '#16a34a',
  successSoft: '#dcfce7',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',
  warning: '#b45309',
  warningSoft: '#fef3c7',
  codeBg: '#1a1a2e',
  codeText: '#a5d6a7',
};

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  const palette = {
    primary: { bg: colors.primary, fg: '#fff', border: colors.primary },
    secondary: { bg: 'transparent', fg: colors.text, border: colors.border },
    danger: { bg: 'transparent', fg: colors.danger, border: colors.danger },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'danger' | 'warning';
}) {
  const palette = {
    neutral: { bg: colors.primarySoft, fg: colors.primary },
    success: { bg: colors.successSoft, fg: colors.success },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
    warning: { bg: colors.warningSoft, fg: colors.warning },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.badgeText, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

export function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function CodeBlock({ data }: { data: unknown }) {
  return (
    <ScrollView
      horizontal
      style={styles.codeWrap}
      contentContainerStyle={styles.codeInner}
    >
      <Text style={styles.codeText}>{JSON.stringify(data, null, 2)}</Text>
    </ScrollView>
  );
}

export function ComingSoon({
  title,
  description,
  bullets,
}: {
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <Card>
      <View style={styles.soonHeader}>
        <SectionTitle>{title}</SectionTitle>
        <Badge label="Coming soon" tone="warning" />
      </View>
      <Paragraph>{description}</Paragraph>
      <View style={styles.soonBox}>
        <Text style={styles.soonBoxTitle}>Planned SDK integration</Text>
        {bullets.map((b) => (
          <Text key={b} style={styles.soonBullet}>
            {'•'}  {b}
          </Text>
        ))}
      </View>
      <Text style={styles.soonNote}>
        UI sudah siap. Hook ke SDK menyusul setelah modul ini diimplementasikan.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  buttonText: { fontSize: 14, fontWeight: '600' },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 11,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  stat: {
    flexGrow: 1,
    flexBasis: 70,
    backgroundColor: colors.bg,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
  codeWrap: {
    backgroundColor: colors.codeBg,
    borderRadius: 8,
    marginTop: 10,
    maxHeight: 280,
  },
  codeInner: { padding: 12 },
  codeText: {
    color: colors.codeText,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  soonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  soonBox: {
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  soonBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  soonBullet: { fontSize: 13, color: colors.muted, lineHeight: 22 },
  soonNote: { fontSize: 12, color: colors.muted, fontStyle: 'italic' },
});
