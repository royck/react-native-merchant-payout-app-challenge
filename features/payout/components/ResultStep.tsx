import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { PayoutResponse } from '@/types/api';
import { formatMoney } from '@/lib/money';
import { colors, radius, sizes, spacing, typography } from '@/theme/tokens';

export function ResultStep({
  result,
  onReset,
}: {
  result: PayoutResponse;
  onReset: () => void;
}) {
  const failed = result.status === 'failed';
  return (
    <View style={styles.card}>
      <View style={[styles.icon, failed ? styles.failedIcon : styles.successIcon]}>
        <ThemedText style={[styles.iconText, failed && styles.failedIconText]}>
          {failed ? '!' : '✓'}
        </ThemedText>
      </View>
      <ThemedText style={styles.title}>
        {failed ? 'Payout failed' : 'Payout submitted'}
      </ThemedText>
      <ThemedText style={styles.description}>
        {formatMoney(result.amount, result.currency)} to {result.iban}
      </ThemedText>
      <ThemedText style={styles.status}>Status: {result.status}</ThemedText>
      <Pressable
        accessibilityRole="button"
        onPress={onReset}
        style={styles.primaryButton}
      >
        <ThemedText style={styles.primaryButtonText}>Make another payout</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.largeCard, padding: spacing.xl },
  icon: {
    alignSelf: 'center',
    width: sizes.resultIcon,
    height: sizes.resultIcon,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  successIcon: { backgroundColor: colors.surfaceSuccess },
  failedIcon: { backgroundColor: colors.surfaceError },
  iconText: { ...typography.resultIcon, color: colors.success, fontWeight: '700' },
  failedIconText: { color: colors.error },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  description: { ...typography.body, color: colors.textBody, textAlign: 'center' },
  status: { ...typography.small, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  primaryButton: {
    minHeight: sizes.touchTarget + spacing.sm,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  primaryButtonText: { ...typography.base, color: colors.onPrimary, fontWeight: '700' },
});
