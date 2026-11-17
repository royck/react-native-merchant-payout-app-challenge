import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { PayoutError } from '@/features/payout/errors';
import { PayoutErrorBanner } from '@/features/payout/components/PayoutErrorBanner';
import { requiresBiometric } from '@/features/payout/policy';
import type { PayoutDraft } from '@/features/payout/schema';
import { formatMoney, parseMoneyInput } from '@/lib/money';
import { colors, radius, sizes, spacing, typography } from '@/theme/tokens';

interface ConfirmationStepProps {
  draft: PayoutDraft;
  error?: PayoutError;
  busy: boolean;
  onConfirm: () => void;
  onEdit: () => void;
}

export function ConfirmationStep({
  draft,
  error,
  busy,
  onConfirm,
  onEdit,
}: ConfirmationStepProps) {
  const amount = parseMoneyInput(draft.amount) ?? 0;
  return (
    <View style={styles.card}>
      <View style={styles.amountWrap}>
        <ThemedText style={styles.label}>PAYOUT AMOUNT</ThemedText>
        <ThemedText style={styles.amount}>{formatMoney(amount, draft.currency)}</ThemedText>
      </View>
      <DetailRow label="Currency" value={draft.currency} />
      <DetailRow
        label="Destination IBAN"
        value={draft.iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()}
      />
      {requiresBiometric(amount) && (
        <ThemedText style={styles.securityNote}>
          Biometric verification is required to confirm this payout.
        </ThemedText>
      )}
      {error && <PayoutErrorBanner error={error} />}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: busy, busy }}
        disabled={busy}
        onPress={onConfirm}
        style={[styles.primaryButton, busy && styles.disabledButton]}
      >
        {busy ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <ThemedText style={styles.primaryButtonText}>Confirm and send</ThemedText>
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: busy }}
        disabled={busy}
        onPress={onEdit}
        style={styles.secondaryButton}
      >
        <ThemedText style={styles.secondaryButtonText}>Edit details</ThemedText>
      </Pressable>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.largeCard, padding: spacing.xl },
  amountWrap: { alignItems: 'center', paddingVertical: spacing.mdPlus, marginBottom: spacing.sm },
  label: { ...typography.small, color: colors.textBody, fontWeight: '700' },
  amount: { ...typography.amount, color: colors.text, fontWeight: '700', marginTop: spacing.sm },
  detailRow: {
    borderTopColor: colors.borderSubtle,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.mdPlus,
    gap: spacing.xs,
  },
  detailLabel: { ...typography.small, color: colors.textSecondary },
  detailValue: { ...typography.body, color: colors.textStrong, fontWeight: '600' },
  securityNote: {
    ...typography.small,
    backgroundColor: colors.surfaceMuted,
    color: colors.primary,
    padding: spacing.md,
    borderRadius: radius.small,
    marginTop: spacing.sm,
  },
  primaryButton: {
    minHeight: sizes.touchTarget + spacing.sm,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  disabledButton: { backgroundColor: colors.primaryDisabled },
  primaryButtonText: { ...typography.base, color: colors.onPrimary, fontWeight: '700' },
  secondaryButton: {
    minHeight: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  secondaryButtonText: { ...typography.small, color: colors.primary, fontWeight: '700' },
});
